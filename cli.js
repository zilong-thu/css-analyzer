#!/usr/bin/env node

const fs       = require('fs');
const path     = require('path');
const meow     = require('meow');
const glob     = require('glob');
const chalk    = require('chalk');
const profiler = require('./profiler.js');
const logger   = require('./utils/log.js');

const DESCRIPTION = `
Usage
  $ css-profile <filename>

Options
  -d, --dir  指定要分析的文件路径
  -p, --port server port

Examples
  $ css-profile ./static/vendor.css ./static/mall.css -p 3000
`;

const cli = meow(DESCRIPTION, {
  flags: {}
});

const input = cli.input;
let filepathList = [];
// glob 模式只支持单个输入的情形
// 转换为绝对路径
if (input.length === 0 && /^\.{1,2}\//.test(input[0])) {
  input[0] = path.resolve(process.cwd(), input[0]);
  filepathList = glob.sync(input[0]);
} else {
  filepathList = cli.input.map(item => {
    return path.resolve(process.cwd(), item);
  });
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
const result = profiler(cssContent);
console.timeEnd('css-profiler');
