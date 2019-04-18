const profiler = require('../profiler.js');
const fs       = require('fs');
const path     = require('path');

let content = fs.readFileSync(path.resolve(__dirname, 'style.css'), 'utf8');
profiler(`input {
  display: inline-block;
}
input {
  border: 1px solid #eee;
  padding: .2rem;
  box-sizing: border-box;
  width: 100%;
  display: block;
}
button {
  background: aquamarine;
  border: none;
  margin-top: .2rem;
  display: block;
  width: 100%;
  box-sizing: border-box;
}`);
