const fs = require('fs');
const profiler = require('./profiler.js');

const cssContent = fs.readFileSync('./test-02.css', 'utf8');
const result = profiler(cssContent);
