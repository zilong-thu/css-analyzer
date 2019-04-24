# CSS-Profiler

CSS-Profiler is a PostCSS Cli tool to analysis CSS code quality, find its problems, and generate a report to guide developers write more clean, maintainable CSS code.

## Features

+ 找出样式名（即选择器）完全相同的样式
+ 找到具有完全相同的内容的所有样式
+ 找出样式内容相似度在 70% 及以上的样式规则
+ 找出前 20 个名字最长的选择器
+ 支持 sourceMap 分析

## 使用

### 命令行用法

目前只支持分析单个 CSS 文件。

```bash
# install
$ npm i -g css-profiler

# analysis one or more css files
$ css-profile style.css
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

## 原理

可能造成代码重复的原因有：

+ 写代码的时候发懒，复制了已有代码
+ 对 `scoped` 机制的使用不恰当
+ 构建过程出现了问题
+ 使用预/后处理器时，重复引入某个 css 源文件


## Author

[zilong-thu](https://github.com/zilong-thu/)
