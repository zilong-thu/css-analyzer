const fs = require('fs');
const postcss = require('postcss');
const chalk = require('chalk');
const Table = require('cli-table3');
const _ = require('lodash');
const logger = require('./utils/log.js');

module.exports = function(cssCode) {
  const root = postcss.parse(cssCode);

  const ruleASTGroupByName = {};
  let ruleCount = 0;

  root.walkRules(rule => {
    const selector = rule.selector;
    ruleCount++;
    if (ruleASTGroupByName[selector] === undefined) {
      ruleASTGroupByName[selector] = {
        count: 1,
        selector,
        selectors: rule.selectors,
        nodes: rule.nodes,
      };
    } else {
      ruleASTGroupByName[selector].count++;
    }
  });

  const table = new Table({
    head: [chalk.white('选择器名称'), chalk.white('出现的次数')],
  });
  
  console.log(chalk.bold('\n==== CSS Static Analysis Report ===='));
  console.log(`共声明了 ${chalk.bold(ruleCount)} 条样式规则`);
  logger.blockTitle('1. Duplicated rules: ');

  const ruleNameArr = Object.keys(ruleASTGroupByName);
  const dpArray = ruleNameArr
    .filter(key => (ruleASTGroupByName[key].count > 1) && (!/\d+%/.test(key)))
    .map(key => ruleASTGroupByName[key]);
  dpArray.forEach(item => {
    table.push([chalk.yellow(item.selector), item.count]);
  });
  console.log(table.toString());
  console.log(`\n共有 ${chalk.bold(dpArray.length)} 个规则具有相同的选择器名字，请检查是否可以进行合并？`);
  // console.log(`\n共有 ${chalk.bold(dpArray.length)} 条规则出现了重复声明。请检查是否存在重复定义或者重复引入的问题。`);

  // 寻找嵌套最深层级最深的 TOP_N 样式
  const TOP_N = 20;
  logger.blockTitle(`2. TOP${TOP_N} 样式名字最长的选择器: `);
  const ruleNameArrCopied = ruleNameArr
    .filter(key => ruleASTGroupByName[key].selectors.length === 1)
    .sort((a, b) => b.length - a.length);
  ruleNameArrCopied.length = TOP_N;
  ruleNameArrCopied.forEach((item, index) => {
    const str = item.replace(/\n/g, '');
    console.log(`[${index + 1}]`, chalk.yellow(str));
  });
}
