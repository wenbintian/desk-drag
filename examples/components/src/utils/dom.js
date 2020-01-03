/**
 * Created by lhn on 2017/8/15.
 */
import Vue from 'vue'
const isServer = Vue.prototype.$isServer;
const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;//特殊字符匹配 :-_
const MOZ_HACK_REGEXP = /^moz([A-Z])/;//对mozilla进行特殊判断，即firefox
const ieVersion = isServer ? 0 : Number(document.documentMode);//判断ie的版本号
/**
 * 去掉头尾空格
 * @param string
 * @returns {string}
 */
const trim = function (string) {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
};
/**
 * 将:-_等变成驼峰式，如foo-bar变成fooBar
 * @param name 要处理的字符串
 * @returns {*}
 */
const camelCase = function (name) {
  return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
    return offset ? letter.toUpperCase() : letter;//// 开头的不大写，其余的大写
  }).replace(MOZ_HACK_REGEXP, 'Moz$1'); // 对moz进行特殊处理
};
/**
 * 添加事件监听
 * @param element 要监听的元素
 * @param event 要监听的事件
 * @param handler 要执行的函数
 */
export const on = (function () {
  if (!isServer && document.addEventListener) {// 浏览器环境，且非IE9以下版本
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false);
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.attachEvent("on" + event, handler);
      }
    }
  }
})();
/**
 * 移除事件监听
 * @param element 监听的元素
 * @param event 监听的事件
 * @param handler 执行的函数
 */
export const off = (function () {
  if (!isServer && document.removeEventListener) {// 浏览器环境，且非IE9以下版本
    return function (element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false);
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event) {
        element.detachEvent("on" + event, handler);
      }
    }
  }
})();
/**
 * 绑定一次性事件监听
 * @param el 要监听的元素
 * @param event 要监听的事件
 * @param fn 回调函数
 */
export const once = function (element, event, handler) {
  var listener = function () {
    if (handler) {
      handler.apply(this, arguments);
    }
    off(element, event, listener);//执行完后解绑
  }
  on(element, event, listener);
};
/**
 * 判断是否包含某类
 * @param el 要检测的元素
 * @param cls 要检测的类名
 * @returns {boolean}
 */
export const hasClass = function (element, cls) {
  if (!element || !cls) return false;
  if (cls.indexOf(" ") != -1)throw new Error('className should not contain space.');
  if (element.classList) {//IE9 以上才有 h5的新特性
    return element.classList.contains(cls);
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
  }
};
/**
 * 给元素添加某些类
 * @param el 要处理的元素
 * @param cls 要添加的类 空格隔开
 */
export function addClass(el, cls) {
  if (!el) return;
  var curClass = el.className;
  const clss = (cls || '').split(" ");
  for (let i = 0, j = clss.length; i < j; i++) {
    var clName = clss[i];
    if (!clName)continue;
    if (el.classList) {
      el.classList.add(clName);
    } else {
      if (!hasClass(el, clName)) {
        curClass += ' ' + clName;
      }
    }
  }
  if (!el.classList) {
    el.className = curClass;
  }
};
/**
 * 给元素移除某些类
 * @param el 要处理的元素
 * @param cls 要移除的类  空格隔开
 */
export function removeClass(el, cls) {
  if (!el || !cls) return;
  const clss = (cls || '').split(" ");
  var curClass = ' ' + el.className + ' ';
  for (let i = 0, j = clss.length; i < j; i++) {
    var clName = clss[i];
    if (!clName)continue;
    if (el.classList) {
      el.classList.remove(clName);
    } else {
      if (hasClass(el, clName)) {
        curClass = curClass.replace(' ' + clName + ' ', ' ');
      }
    }
  }
  if (!el.classList) {
    el.className = trim(curClass);
  }
};
/**
 * 获取样式，分IE9一下和其他两种方式处理,虽然有重复代码，但是性能最优
 * @type {Function}
 * @param element 要获取样式的元素
 * @param styleName 要获取的样式名
 */
export const getStyle = ieVersion < 9 ? function (element, styleName) {
  if (isServer) return;
  if (!element || !styleName) return null;
  styleName = camelCase(styleName);
  if (styleName === 'float') {
    styleName = 'styleFloat';
  }
  try {
    switch (styleName) {
      case 'opacity':
      {
        try {
          return element.filters.item('alpha').opacity / 100;
        } catch (e) {
          return 1.0;
        }
      }
      default:
        return (element.style[styleName] || element.currentStyle ? element.currentStyle[styleName] : null);
    }
  } catch (e) {
    return element.style[styleName];
  }
} : function (element, styleName) {
  if (isServer) return;
  if (!element || !styleName) return null;
  styleName = camelCase(styleName);
  if (styleName === 'float') {
    styleName = 'cssFloat';
  }
  try {
    var computed = document.defaultView.getComputedStyle(element, '');
    return element.style[styleName] || computed ? computed[styleName] : null;
  } catch (e) {
    return element.style[styleName];
  }
};
/**
 * 设置元素的样式
 * @param element 要设置的元素
 * @param styleName 要设置的样式  支持json对象，当为对象时，value 就没有了
 * @param value 要设置的值
 */
export function setStyle(element, styleName, value) {
  if (!element || !styleName)return;
  if (typeof styleName === 'object') {
    for (var prop in styleName) {
      if (styleName.hasOwnProperty(prop)) {//函数用于指示一个对象自身(不包括原型链)是否具有指定名称的属性
        setStyle(element, prop, styleName[prop]);
      }
    }
  } else {
    styleName = camelCase(styleName);
    if (styleName === 'opacity' && ieVersion < 9) {
      element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')';
    } else {
      element.style[styleName] = value;
    }
  }
};
