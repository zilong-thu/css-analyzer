const profiler = require('../profiler.js');
const fs       = require('fs');
const path     = require('path');

let content = fs.readFileSync(path.resolve(__dirname, 'vendor.css'), 'utf8');
let sourceMap = fs.readFileSync(path.resolve(__dirname, 'vendor.css.map'), 'utf8');

const code = {
  cssCode: `input {
  display: inline-block;
}
input {
  border: 1px solid #eee;
  padding: .2rem;
  box-sizing: border-box;
  width: 100%;
  display: block;
}
.coupon-card .icon-arrow-down-2::after, .coupon-card .icon-arrow-down-2::before {
  /**
   * 动画暂时又去掉了
   * transition: transform .3s cubic-bezier(.645, .045, .355, 1), top .3s ease;
   */
}
.go-base-button.alarm.touched::before {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  border-style: solid;
  border-width: 1px;
  border-color: #E04C4C;
  border-radius: 3rem;
  height: 300%;
  width: 300%;
  -webkit-transform: scale(0.3333);
          transform: scale(0.3333);
  box-sizing: border-box;
  pointer-events: none; }`,
};

profiler({
  cssCode: content,
  sourceMap,
});
