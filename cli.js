#!/usr/bin/env node

const fs       = require('fs');
const path     = require('path');
const meow     = require('meow');
const glob     = require('glob');
const chalk    = require('chalk');
const Table    = require('cli-table3');
const profiler = require('./profiler.js');
const logger   = require('./utils/log.js');
const render   = require('./utils/render-html.js');
const packageMeta = require('./package.json');

const DESCRIPTION = `
${chalk.green.bold('CSS-Profiler')}@${packageMeta.version}

Usage
  $ css-profile <filename>

Options
  --concat, -c        是否对多个文件进行拼接分析
  --out, -o           指定 html 报告的输出文件。默认会在当前工作目录下创建一个名为 css-profile-report.html 的文件并且尝试用 Chrome 打开它
  --open-in-browser   在浏览器中自动打开，默认为 true
  --ignore-scope, -i  分析时忽略那些 scope 属性。如果设置为 true，那么 .clearfix[d-v-a89fcbed]，分析时会忽略 [d-v-a89fcbed].

Examples
  $ css-profile ./static/vendor.css ./static/mall.css --type html
  $ css-profile ./static/vendor.css --out report.html
  $ css-profile ./style.css
`;

const cli = meow(DESCRIPTION, {
  flags: {
    out: {
      type: 'string',
      alias: 'o',
    },
    openInBrowser: {
      type: 'boolean',
      default: true,
    }
  }
});

// console.log(cli.flags);

const input = cli.input;
let filepathList = [];
// glob 模式只支持单个输入的情形
// 转换为绝对路径
if (input.length === 1 && /^\.{1,2}\//.test(input[0])) {
  input[0] = path.resolve(process.cwd(), input[0]);
  filepathList = glob.sync(input[0]);
} else if (input.length >= 2) {
  filepathList = cli.input.map(item => {
    return path.resolve(process.cwd(), item);
  });
} else {
  console.log(DESCRIPTION);
  return;
}

if (filepathList.length > 1) {
  console.log(chalk.red('抱歉，目前只支持分析最多1个css文件'));
  process.exit(1);
}

const flags = cli.flags;

const cssInputList = [];

logger.blockTitle('处理的文件：');
/*# sourceMappingURL=mall.49ccd68bcf64a24a19b2.css.map*/
const sourceMapReg = /\/\*#\s*sourceMappingURL=(.+)\*\//;
filepathList.forEach(item => {
  console.log('  ' + item);
  let content = fs.readFileSync(item, 'utf8');
  const res = sourceMapReg.exec(content);
  sourceMapFilePath = res ? path.resolve(path.dirname(item), res[1]) : '';
  const ele = {
    path: item,
    cssCode: content,
    sourceMapFilePath,
    sourceMap: sourceMapFilePath ? fs.readFileSync(sourceMapFilePath, 'utf8') : '',
  };
  cssInputList.push(ele);
});

console.time('css-profiler');

const cssInputItem = cssInputList[0];

const result = profiler(cssInputItem, flags);
result.cssInputList = cssInputList;

const outputFileName = flags.out || 'css-profile-report.html';
render(result, {
  openInBrowser: flags.openInBrowser,
  out: outputFileName,
});
console.timeEnd('css-profiler');
console.log('version: ', packageMeta.version);
