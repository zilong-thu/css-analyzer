# CSS-Profiler

CSS-Profiler is a PostCSS Cli tool to analysis CSS code quality, find its problems, and generate a report to guide developers write more clean, maintainable CSS code.

## Features

+ Find out duplicated rules.
+ Fine TOP20 selectors that have most characters.

## Usage

### Command Line Usage

```bash
# install
$ npm i -g css-profiler

# analysis one or more css files
$ css-profile style.css style2.css
# result will display below.
```

### Node.js API

**TODO**

```javascript
const cssProfiler = require('css-profiler');

const cssContent = `
input {
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
}`;

let result = cssProfiler(cssContent);
```

## Author

[zilong-thu](https://github.com/zilong-thu/)
