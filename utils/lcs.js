/**
 * 参考《算法导论》15.4 节最长公共子序列问题
 * Longest Common Subsequence Problem
 * 这里要用到的只是长度即可，并不需要公共子序列的内容。
 */

function LCSLength(X, Y) {
  const dp = {};
  for (let i = 1; i <= X.length; i++) {
    dp[`${i},0`] = 0;
  }
  for (let i = 1; i <= Y.length; i++) {
    dp[`0,${i}`] = 0;
  }
  for (let i = 1; i <= X.length; i++) {
    for (let j = 1; j <= Y.length; j++) {
      if (X[i - 1] === Y[j - 1]) {
        dp[`${i},${j}`] = dp[`${i - 1},${j - 1}`] + 1;
      } else if (dp[`${i},${j - 1}`] >= dp[`${i - 1},${j}`]) {
        dp[`${i},${j}`] = dp[`${i},${j - 1}`];
      } else {
        dp[`${i},${j}`] = dp[`${i - 1},${j}`];
      }
    }
  }

  return dp[`${X.length},${Y.length}`];
}


module.exports = LCSLength;
