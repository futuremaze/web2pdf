var prog = process.argv[1].replace(/^.*[\\\/]/, '');

function check_args(args) {
  if(args.targets.length != 1) {
    console.error(`${prog}:Fatal:Url is not given.`);
    argv.help();
    process.exit(1);
  }
  args.options.outputdir = args.options.outputdir || "./";
  args.options.device = args.options.device || "iPhone 6";
  // if(devices.indexOf(args.options.device) == -1) {
  //   console.error(`${prog}:Fatal:The specified device does not exist.`);
  //   console.error(`  You can select from the devices described below.`);
  //   for (var i=0; i<devices.length; i++) {
  //     console.error(`    '${devices[i].name}'`);
  //   }
  //   process.exit(1);
  // }

  return(args);
}

function do_web2pdf(args) {
  args = check_args(args);

  (async () => {
    const fs = require('fs-extra');
    const puppeteer = require('puppeteer');
    const devices = require('puppeteer/DeviceDescriptors');
    const browser = await puppeteer.launch({
      // headless: false,
      "ignoreHTTPSErrors": true
    });
    const page = await browser.newPage();

    try {
      await page.emulate(devices[args.options.device]);
      await page.goto(args.targets[0], {waitUntil: "domcontentloaded"});
    } catch (e) {
      console.error(`${prog}:${e}`);
      process.exit(1);
    }
  
    // output pdf.
    var filename = (await page.title() + '.pdf').replace('/','／');
    var width = await devices[args.options.device].viewport.width;
    var height = await devices[args.options.device].viewport.height;
    var deviceScaleFactor = await devices[args.options.device].viewport.deviceScaleFactor;

    try {
      fs.mkdirsSync(args.options.outputdir);
    } catch (e) {
      console.error(`${prog}:${e}`);
      process.exit(1);
    }
    await page.pdf({
      path: args.options.outputdir + '/' + filename,
      printBackground: true,
      width: width * deviceScaleFactor,
      height: height * deviceScaleFactor
    });
    await browser.close();
  })();
}

function do_main() {
  var argv = require('argv');
  var devices = require('puppeteer/DeviceDescriptors');
  
  argv.version('v1.0');
  argv.info(`${prog} [options] url`);
  argv.option({
      name: 'outputdir',
      short: 'o',
      type: 'path',
      description: 'The destination directory to save your pdf.',
      example: `'${prog} -o /path/to url' or '${prog} --outputdir /path/to url'`
  });
  argv.option({
      name: 'device',
      short: 'd',
      type: 'string',
      description: 'Emulate device to access url.',
      example: `'${prog} -d "iPhone 6" url' or '${prog} --device "iPhone 6" url'`
  });

  var args = argv.run();
  do_web2pdf(args);
}

do_main();
