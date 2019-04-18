const fs   = require('fs');
const path = require('path');
const ejs  = require('ejs');
const childProcess = require('child_process');

// html template
const tplFile = path.resolve(__dirname, '../layout.ejs');
const tplString = fs.readFileSync(tplFile, 'utf8');
const template = ejs.compile(tplString);

// css files
const cssFiles = [
  '../layout.css',
];
let cssCode = '';
cssFiles.forEach(item => {
  const content = fs.readFileSync(path.resolve(__dirname, item), 'utf8');
  cssCode += content;
});

// js code
const jsFiles = [
  '../vendor/highlight.min.js',
];
let jsCode = '';
jsFiles.forEach(item => {
  const content = fs.readFileSync(path.resolve(__dirname, item), 'utf8');
  jsCode += content;
});

module.exports = function(data, options = {}) {
  data.cssCode = cssCode;
  data.jsCode  = jsCode;

  const outputFileName = options.out || 'css-profile-report.html';
 
  const html = template(data);
  const outputFilePath = path.resolve(process.cwd(), outputFileName);
  fs.writeFileSync(outputFilePath, html);

  if (options.openInBrowser) {
    console.log(`\n正在尝试打开Chrome浏览器……\n`);
    try {
      childProcess.exec(`open -a "Google Chrome" ${outputFilePath}`);
    } catch (err) {
      console.log(err);
    }
  }
  return html;
}
