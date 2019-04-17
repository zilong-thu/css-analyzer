const profiler = require('../profiler.js');
const fs       = require('fs');
const path     = require('path');

let content = fs.readFileSync(path.resolve(__dirname, 'style.css'), 'utf8');
profiler(content);
