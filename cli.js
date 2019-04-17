#!/usr/bin/env node

const fs       = require('fs');
const path     = require('path');
const meow     = require('meow');
const analyzer = require('./analyzer.js');


const DESCRIPTION = `
Usage
  $ css-profile <filename>

Options
  -d, --dir  指定要分析的文件路径
  -p, --port server port

Examples
  $ css-profile -d ./src -p 3000
`;

const cli = meow(DESCRIPTION, {
  flags: {}
});

const filepathList = cli.input.map(item => {
  return path.resolve(process.cwd(), item);
});

const flags = cli.flags;
console.log('flags: ', flags);

console.time('css-analyzer');
let cssContent = '';
console.log('处理的文件：');
filepathList.forEach(item => {
  console.log(item);
  let content = fs.readFileSync(item, 'utf8');
  cssContent += content;
});
const result = analyzer(cssContent);
console.timeEnd('css-analyzer');
