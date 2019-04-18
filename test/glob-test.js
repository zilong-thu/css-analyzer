const path = require('path');
const glob = require('glob');

const files = glob.sync(path.resolve(__dirname, 'style.css'));
console.log('files: ', files);
