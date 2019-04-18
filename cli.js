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

const DESCRIPTION = `
Usage
  $ css-profile <filename>

Options
  --type, -t  报告的输出方式
    std : 打印到标准输入输出设备上（此为默认值）
    html: 输出 html 形式的报告，并在浏览器里打开
  --out, -o   指定 html 报告的输出文件。默认会在当前工作目录下创建一个名为 css-profile-report.html 的文件并且尝试用 Chrome 打开它
  --open-in-browser  在浏览器中自动打开，默认为 true

Examples
  $ css-profile ./static/vendor.css ./static/mall.css --type html
  $ css-profile ./static/vendor.css --out report.html
  $ css-profile ./style.css
`;

const cli = meow(DESCRIPTION, {
  flags: {
    type: {
      type: 'string',
      default: 'std',
    },
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
} else if (input.length >=2) {
  filepathList = cli.input.map(item => {
    return path.resolve(process.cwd(), item);
  });
} else {
  console.log(DESCRIPTION);
  return;
}

const flags = cli.flags;

let cssContent = '';
logger.blockTitle('处理的文件：');
filepathList.forEach(item => {
  console.log('  ' + item);
  let content = fs.readFileSync(item, 'utf8');
  cssContent += content;
});

if (filepathList.length > 2) {
  console.log(chalk.red('抱歉，目前只支持分析最多两个css文件'));
  process.exit(1);
}

console.time('css-profiler');

const result = profiler(cssContent, flags);
result.filepathList = filepathList;

if (flags.type === 'html' || flags.out) {
  render(result, {
    openInBrowser: flags.openInBrowser,
    out: flags.out,
  });
} else {
  console.log(chalk.bold('\n==== CSS Static Analysis Report ===='));
  console.log(`共声明了 ${chalk.bold(result.ruleCount)} 条样式规则`);

  logger.blockTitle('1. Duplicated rules: ');
  const table = new Table({
    head: [chalk.white('选择器名称'), chalk.white('出现的次数')],
  });
  result.duplicatedRules.forEach(item => {
    table.push([chalk.yellow(item.selector), item.count]);
  });
  console.log(table.toString());
  console.log(`
共有 ${chalk.bold(result.duplicatedRules.length)} 个规则具有相同的选择器名字，请检查是否可以进行合并？
提示：此问题通常由于重复定义样式，或者重复导入 css 文件引起。`);

  logger.blockTitle(`2. TOP${result.TOP_N} 样式名字最长的选择器: `);
  result.top20LongNames.forEach((item, index) => {
    const str = item.replace(/\n/g, '');
    console.log(`[${index + 1}]`, chalk.yellow(str));
  });
}

console.timeEnd('css-profiler');
