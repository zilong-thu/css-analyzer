const fs = require('fs');
const postcss = require('postcss');
const _ = require('lodash');
const logger = require('./utils/log.js');

/**
 * 删除 Vue 打上的 scope hash
 * @param {String} str 
 */
function removeVueStyleHashMark(str) {
  const reg = /\[data-v-[a-f0-9]{8}\]/g;
  if (reg.test(str)) {
    str = str.replace(reg, '');
  }
  return str;
}

module.exports = function(cssCode, userOptions = {}) {
  const root = postcss.parse(cssCode);

  const ruleASTGroupByName = {};
  let ruleCount = 0;

  /**
   * 抽象了的{规则: 样式内容}数组
   * [{
   *   selector: '.clearfix',
   *   content: 'overflow: auto; zoom: 1;'
   * }, {}]
   */
  const selectorAndContentArr = [];

  root.walkRules(rule => {
    const selector = removeVueStyleHashMark(rule.selector);

    // 跳过 keyframes 里的样式声明
    if (['from', 'to'].includes(selector)) {
      return;
    }
    ruleCount++;

    // 将每个 rule 的规则内容按照默认排序顺序（即根据字符串Unicode码点）进行排序后拼接为一个字符串
    // 把注释过滤掉
    let content = rule.nodes
      .filter(item => item.type === 'decl')
      .map(item => item.toString());
    if (content.length) {
      content.sort();
      selectorAndContentArr.push({
        selector,
        content: content.join('; ') + ';',
      });
    }

    if (ruleASTGroupByName[selector] === undefined) {
      ruleASTGroupByName[selector] = {
        count: 1,
        selector,
        selectors: rule.selectors,
        nodes: rule.nodes,
        codes: [rule.toString()],
      };
    } else {
      ruleASTGroupByName[selector].count++;
      ruleASTGroupByName[selector].codes.push(rule.toString());
    }
  });

  // fs.writeFileSync('content.json', JSON.stringify(selectorAndContentArr, null, 2));

  const ruleNameArr = Object.keys(ruleASTGroupByName);
  const dpArray = ruleNameArr
    .filter(key => (ruleASTGroupByName[key].count > 1) && (!/\d+%/.test(key)))
    .map(key => ruleASTGroupByName[key]);

  // 寻找样式名字最长的 TOP_N 选择器
  const TOP_N = 20;
  const ruleNameArrCopied = ruleNameArr
    .filter(key => ruleASTGroupByName[key].selectors.length === 1)
    .sort((a, b) => b.length - a.length);
  ruleNameArrCopied.length = TOP_N;

  return {
    TOP_N,
    time: new Date(),
    ruleCount,
    duplicatedRules: dpArray,
    top20LongNames: ruleNameArrCopied,
  };
}
