const fs = require('fs');
const postcss = require('postcss');
const chalk = require('chalk');
const Table = require('cli-table2');

module.exports = function(cssCode) {
  const root = postcss.parse(cssCode);

  const ruleNameObj = {};
  const ruleContentObj = {};

  root.walkRules(rule => {
    const selector = rule.selector;
    if (ruleNameObj[selector] === undefined) {
      ruleNameObj[selector] = 1;
    } else {
      ruleNameObj[selector]++;
    }
  });

  const table = new Table({
    head: [chalk.white('选择器名称'), chalk.white('重复出现的次数')],
  });
  const SPLIT_LINE = chalk.grey('---------------------------------------------');
  console.log(chalk.bold('\n==== CSS Static Analysis Report ===='));
  console.log(SPLIT_LINE);
  console.log('Duplicated rules: ');
  console.log(SPLIT_LINE);
  const dpArray = Object.keys(ruleNameObj)
    .filter(key => {
      return (ruleNameObj[key] > 1)
        && (!/\d+%/.test(key));
    })
    .map(key => {
      return {
        selector: key,
        count: ruleNameObj[key],
      };
    });
    dpArray.forEach(item => {
      table.push([chalk.yellow(item.selector), item.count]);
    });
    console.log(table.toString());
    console.log(`\n共有 ${chalk.bold(dpArray.length)} 个规则具有相同的选择器名字，请检查是否可以进行合并？`);
    // console.log(`\n共有 ${chalk.bold(dpArray.length)} 条规则出现了重复声明。请检查是否存在重复定义或者重复引入的问题。`);
}
