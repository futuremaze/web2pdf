var prog = process.argv[1].replace(/^.*[\\\/]/, '');

function do_web2pdf(url, options={}, callback=undefined) {
  if (url === undefined) return(1);
  var emulate_device = options.device || "iPhone 6";
  var base_dir = options.basedir || "./";
  var output_dir = options.outputdir || "./";
  var callback_on_complete = callback || function(result_code){};

  (async () => {
    const fs = require('fs-extra');
    const puppeteer = require('puppeteer');
    const devices = require('puppeteer/DeviceDescriptors');
    const browser = await puppeteer.launch({
      "ignoreHTTPSErrors": true,
      "args": [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });
    const page = await browser.newPage();

    try {
      await page.emulate(devices[emulate_device]);
      await page.goto(url, {waitUntil: "domcontentloaded", timeout: 60000});
    } catch (e) {
      console.error(`${prog}:${e}`);
      callback_on_complete(1);
    }  

    // convert to pdf.
    try {
      var title = await page.title();
      if(title === undefined || title == "") title = (+new Date());
      var filename = (await title + '.pdf').replace('/','_');
      var width = await devices[emulate_device].viewport.width;
      var height = await devices[emulate_device].viewport.height;
      var deviceScaleFactor = await devices[emulate_device].viewport.deviceScaleFactor;

      fs.mkdirsSync(`${base_dir}/${output_dir}`);
    } catch (e) {
      console.error(`${prog}:${e}`);
      callback_on_complete(1);
    }

    await page.pdf({
      path: `${base_dir}/${output_dir}/${filename}`,
      printBackground: true,
      width: width * deviceScaleFactor,
      height: height * deviceScaleFactor
    });

    await browser.close();
    callback_on_complete(0);
  })();
}

function launch_server(options={}) {
  var http   = require('http');
  var url    = require('url');
  var server = http.createServer();
  var port   = options.port || 8080;

  server.on('request', function(req, res) {
    var url_path = url.parse(req.url).pathname;
    var body = '';

    if (url_path == '/web2pdf') {
      if (req.method == 'POST' &&
        req.headers['content-type'] == 'application/json') {
        req.on('data', function(data) { body += data; });
        req.on('end', function(){
          try {
            var json = JSON.parse(body);
          } catch(e) {
            console.error(`${prog}:${e}`);
            return;
          }
          
          var url = json.url;
          options.outputdir = json.outputdir;
          options.device = json.device;
          options.port = port;
          do_web2pdf(url, options, function(result_code) {
            if (result_code == 0) {
              res.writeHead(200, {'Content-Type': 'text/plain'});
              res.write('OK\n\n');
            } else {
              res.writeHead(500);
              res.write('NG\n\n');
            }
            res.end();
          });
        });
      }
    }
  });

  try {
    server.listen(port);
  } catch(e) {
    console.error(`${prog}:${e}`);
    process.exit(1);
  }
}

function check_args(args) {
  args.options.basedir = args.options.basedir || "./";
  args.options.outputdir = args.options.outputdir || "./";
  args.options.device = args.options.device || "iPhone 6";
  args.options.server = args.options.server || false;
  args.options.port = args.options.port || 8080;

  if(!args.options.server && args.targets.length != 1) {
    console.error(`${prog}:Fatal:Url is not given.`);
    process.exit(1);
  }
 
  return(args);
}

function do_main() {
  var argv = require('argv');
  
  argv.version('v1.0');
  argv.info(`${prog} [options] url`);
  argv.option({
      name: 'basedir',
      short: 'b',
      type: 'path',
      description: 'The destination directory to save your pdf.',
      example: `'${prog} -b /path/to url' or '${prog} --basedir /path/to url'`
  });
  argv.option({
      name: 'outputdir',
      short: 'o',
      type: 'path',
      description: 'The relative path from base directory to save your pdf.',
      example: `'${prog} -o ./path/to url' or '${prog} --outputdir ./path/to url'`
  });
  argv.option({
      name: 'device',
      short: 'd',
      type: 'string',
      description: 'Emulate device to access url.',
      example: `'${prog} -d "iPhone 6" url' or '${prog} --device "iPhone 6" url'`
  });
  argv.option({
      name: 'server',
      short: 's',
      type: 'boolean',
      description: 'Start up in server mode.',
      example: `'${prog} -s url' or '${prog} --server url'`
  });
  argv.option({
      name: 'port',
      short: 'p',
      type: 'int',
      description: 'Set the port of the server.(valid in server mode.)',
      example: `'${prog} -s -p 8080 url' or '${prog} --server --port 8080 url'`
  });

  var args = argv.run();
  if (args.options.server) {
    launch_server(args.options);
  } else {
    do_web2pdf(args.targets[0], args.options, function(result_code) {
      console.log(`Complete(${result_code})`);
    });
  }
}

do_main();
