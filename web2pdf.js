var prog = process.argv[1].replace(/^.*[\\\/]/, '');

function do_web2pdf(args) {
  (async () => {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      // headless: false,
      "ignoreHTTPSErrors": true
    });
    const page = await browser.newPage();
    await page.setUserAgent(args.options.useragent);
    await page.setViewport({
      width: args.options.width,
      height: args.options.height,
      isMobile: true
    });
  
    try {
      await page.goto(args.targets[0], {waitUntil: "domcontentloaded"});
    } catch (e) {
      console.error(`${prog}:${e}`);
      process.exit(1);
    }
  
    var filename = (await page.title() + '.pdf').replace('/','／');
    await page.pdf({
      path: args.options.dir + '/' + filename,
      printBackground: true,
      width: args.options.width,
      height: args.options.height
    });
    await browser.close();
  })();
}

function do_main() {
  var argv = require('argv');
  
  argv.version('v1.0');
  argv.info(`${prog} [options] url`);
  argv.option({
      name: 'dir',
      short: 'd',
      type: 'path',
      description: 'The destination directory to save your pdf.',
      example: `'${prog} -d /path/to url' or '${prog} --dir /path/to url'`
  });
  argv.option({
      name: 'width',
      short: 'w',
      type: 'int',
      description: 'The width(px) of browser\'s viewport and PDF.',
      example: `'${prog} -w 750 url' or '${prog} --width 750 url'`
  });
  argv.option({
      name: 'height',
      short: 'h',
      type: 'int',
      description: 'The height(px) of browser\'s viewport and PDF.',
      example: `'${prog} -h 1334 url' or '${prog} --height 1334 url'`
  });
  argv.option({
      name: 'useragent',
      short: 'u',
      type: 'string',
      description: 'User-Agent which is used to access url.',
      example: `'${prog} -u "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1" url' or '${prog} --useragent "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1" url'`
  });

  // check target and options.
  var args = argv.run();
  if(args.targets.length != 1) {
    console.error(`${prog}:Fatal:Url is not given.`);
    argv.help();
    process.exit(1);
  }
  args.options.dir = args.options.dir || "./";
  args.options.width = args.options.width || 750;
  args.options.height = args.options.height || 1334;
  args.options.useragent = args.options.useragent || "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1";

  do_web2pdf(args);
}

do_main();
