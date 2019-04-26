/**
 * 15.4 最长公共子序列问题
 * Longest Common Subsequence Problem
 */

function LCSLength(X, Y) {
  const matrix = {};
  const dp = {};
  for (let i = 1; i <= X.length; i++) {
    matrix[`${i},0`] = 0;
  }
  for (let i = 1; i <= Y.length; i++) {
    matrix[`0,${i}`] = 0;
  }
  for (let i = 1; i <= X.length; i++) {
    for (let j = 1; j <= Y.length; j++) {
      if (X[i - 1] === Y[j - 1]) {
        matrix[`${i},${j}`] = matrix[`${i - 1},${j - 1}`] + 1;
        dp[`${i},${j}`] = X[i - 1];
      } else if (matrix[`${i},${j - 1}`] >= matrix[`${i - 1},${j}`]) {
        matrix[`${i},${j}`] = matrix[`${i},${j - 1}`];
        dp[`${i},${j}`] = -1;
      } else {
        matrix[`${i},${j}`] = matrix[`${i - 1},${j}`];
        dp[`${i},${j}`] = 1;
      }
    }
  }

  return {dp, matrix};
}


module.exports = function(X, Y) {
  const {dp, matrix} = LCSLength(X, Y);
  let str = [];

  for (let i = X.length, j = Y.length; i > 0 && j > 0;) {
    const _dp = dp[`${i},${j}`];
    if (typeof _dp === 'string') {
      str.push(_dp);
      i--;
      j--;
    } else if (_dp === -1) {
      j--;
    } else {
      i--;
    }
  }

  return str;
}
