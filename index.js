const fs = require('fs');
const profiler = require('./profiler.js');

console.time('css-profiler');
const cssContent = fs.readFileSync('./test-02.css', 'utf8');
const result = profiler(cssContent);
console.timeEnd('css-profiler');
