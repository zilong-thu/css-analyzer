const chalk = require('chalk');

const SPLIT_LINE = chalk.grey('---------------------------------------------');

module.exports = {
  blockTitle(title) {
    console.log('\n' + SPLIT_LINE);
    console.log(title);
    console.log(SPLIT_LINE);
  }
}