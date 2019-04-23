const fs = require('fs');
const _  = require('lodash');
const postcss = require('postcss');
const logger  = require('./utils/log.js');
const decodeMappings = require('./utils/decode-mappings.js');

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

    // 选择器在输入文件中的位置
    let position = {
      line: rule.source.start.line,
      column: rule.source.start.column,
    };

    // 选择器以0起点的位置
    let selectorPosition = {
      line_zeroBased: rule.source.start.line - 1,
      column_zeroBased: rule.source.start.column - 1,
    };

    // 尝试用选择器的位置去找源码位置
    let sourcePositionArr = mappingsDecoded[selectorPosition.line_zeroBased]
      ? mappingsDecoded[selectorPosition.line_zeroBased].find(item => item[0] === selectorPosition.column_zeroBased)
      : null;

    // 如果找不到，就用节点的位置去找，这个一定能找到
    // if (!sourcePositionArr) {
      // let firstNodePosition = {
      //   line_zeroBased: rule.nodes[0].source.start.line - 1,
      //   column_zeroBased: rule.nodes[0].source.start.column - 1,
      // };
      // sourcePositionArr = mappingsDecoded[firstNodePosition.line_zeroBased]
      //   ? mappingsDecoded[firstNodePosition.line_zeroBased].find(item => item[0] === firstNodePosition.column_zeroBased)
      //   : null;
      // if (sourcePositionArr) {
      //   sourcePositionArr = _.cloneDeep(sourcePositionArr);
      //   sourcePositionArr[2]--;
      //   sourcePositionArr[3]--;
      // }
    // }
    // console.log('sourcePositionArr: ', sourcePositionArr);

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
