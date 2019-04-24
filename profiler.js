const fs = require('fs');
const _  = require('lodash');
const postcss = require('postcss');
const logger  = require('./utils/log.js');
const decodeMappings = require('./utils/decode-mappings.js');
const findLCS = require('./utils/lcs.js');

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

module.exports = function(cssInputItem, userOptions = {}) {
  let {cssCode, sourceMap} = cssInputItem;
  sourceMap = JSON.parse(sourceMap);

  const root = postcss.parse(cssCode);
  const mappingsDecoded = decodeMappings(sourceMap.mappings);

  const ruleASTGroupByName = {};
  let ruleCount = 0;

  /**
   * 抽象了的{规则: 样式内容}数组
   * [{
   *   selector: '.clearfix',
   *   content: 'overflow: auto; zoom: 1;',
   *   position: {line: 1, column: 1},
   * }, {}]
   */
  const selectorAndContentList = [];

  root.walkRules(rule => {
    const selector = removeVueStyleHashMark(rule.selector);

    // 跳过 keyframes 里的样式声明
    if (['from', 'to'].includes(selector)) {
      return;
    }
    ruleCount++;


    // 选择器在输入文件中的位置
    let position = {
      line: rule.source.start.line,
      column: rule.source.start.column,
      // 选择器以0起点的位置
      line_zeroBased: rule.source.start.line - 1,
      column_zeroBased: rule.source.start.column - 1,
    };

    // 尝试用选择器的位置去找源码位置
    let sourcePositionArr = mappingsDecoded[position.line_zeroBased]
      ? mappingsDecoded[position.line_zeroBased].find(item => item[0] === position.column_zeroBased)
      : null;

    let sourcePosition = null;
    if (sourcePositionArr) {
      let sourceFile = sourceMap.sources[sourcePositionArr[1]];
      sourceFile = sourceFile.replace(/webpack:\/\/\//, '');

      sourcePosition = {
        line: sourcePositionArr[2] + 1,
        column: sourcePositionArr[3] + 1,
        sourceFile,
      }
    }


    /**
     * 规则名与内容记录
     * 将每个 rule 的规则内容按照默认排序顺序（即根据字符串Unicode码点）进行排序后拼接为一个字符串
     * 把注释过滤掉
     */
    let content = rule.nodes
      .filter(item => item.type === 'decl')
      .map(item => item.toString());
    if (content.length) {
      content.sort();
      selectorAndContentList.push({
        selector,
        code: rule.toString(),
        contentArr: content,
        content: content.join(';'),
        position: {
          line: rule.source.start.line,
          column: rule.source.start.column,
        },
        sourcePosition,
      });
    }

    /**
     * 规则名字记录
     */
    if (ruleASTGroupByName[selector] === undefined) {
      ruleASTGroupByName[selector] = {
        count: 1,
        selector,
        selectors: rule.selectors,
        nodes: rule.nodes,
        codes: [rule.toString()],
        // 记录代码的起始位置
        positions: [position],
        sourcePositions: [sourcePosition],
      };
    } else {
      ruleASTGroupByName[selector].count++;
      ruleASTGroupByName[selector].codes.push(rule.toString());
      ruleASTGroupByName[selector].positions.push(position);
      ruleASTGroupByName[selector].sourcePositions.push(sourcePosition);
    }
  });

  const ruleNameArr = Object.keys(ruleASTGroupByName);
  const dpArray = ruleNameArr
    .filter(key => (ruleASTGroupByName[key].count > 1) && (!/\d+%/.test(key)))
    .map(key => ruleASTGroupByName[key]);

  /**
   * 寻找样式名字最长的 TOP_N 选择器
   */
  const TOP_N = 20;
  const ruleNameArrCopied = ruleNameArr
    .filter(key => ruleASTGroupByName[key].selectors.length === 1)
    .sort((a, b) => b.length - a.length);
  ruleNameArrCopied.length = TOP_N;

  /**
   * 文件内部的样式内容相似性分析
   */
  // 找出内容完全一样的样式
  let rulesHaveSimilarContent = [];
  const keyByContent = {};
  for (let i = 0; i < selectorAndContentList.length - 1; i++) {
    let a = selectorAndContentList[i];

    if (/\d+%/.test(a.selector)) {
      continue;
    }

    for (let j = i + 1; j < selectorAndContentList.length; j++) {
      let b = selectorAndContentList[j];
      if (/\d+%/.test(b.selector)) {
        continue;
      }
      if (a.content === b.content && (i !== j)) {
        const key = a.content;
        if (!keyByContent[key]) {
          const s = new Set();
          s.add(i);
          s.add(j);
          keyByContent[key] = s;
        } else {
          keyByContent[key].add(j);
        }
      } else {
        /**
         * 寻找两个内容的最长公共子序列（以属性、值为最小分隔单元）
         */
        let lcsRes = findLCS(a.contentArr, b.contentArr);
        const similarity = Math.min(lcsRes.length / a.contentArr.length, lcsRes.length / b.contentArr.length);
        if (similarity >= 0.7) {
          rulesHaveSimilarContent.push({
            nodes: [a, b],
            similarity: (similarity * 100).toFixed(2) + '%',
          });
        }
      }
    }
  }
  Object.keys(keyByContent).forEach(key => {
    const s = keyByContent[key];
    keyByContent[key] = [];
    for(let item of s.values()) {
      keyByContent[key].push(selectorAndContentList[item]);
    }
  });


  return {
    TOP_N,
    time: new Date(),
    ruleCount,
    duplicatedRules: dpArray,
    top20LongNames: ruleNameArrCopied,
    keyByContent,
    rulesHaveSimilarContent,
  };
}
