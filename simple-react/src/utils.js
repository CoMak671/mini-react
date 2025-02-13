export const REACT_ELEMENT = Symbol('react.element');
export const REACT_FORWARD_REF = Symbol('react.forward_ref');
export const REACT_TEXT = Symbol('react_text');
export const REACT_MEMO = Symbol('react.memo');

export const toVNode = (node) => {
  return typeof node === 'string' || typeof node === 'number'
    ? { type: REACT_TEXT, props: { text: node } }
    : node;
};

export const CREATE = Symbol('react.dom.diff.create');
export const MOVE = Symbol('react.dom.diff.move');

export const deepClone = (obj) => {
  let type = getType(obj);
  let resultType;
  if (type === 'array') {
    resultType = [];
    obj.forEach((item) => {
      resultType.push(deepClone(item));
    });
    return resultType;
  } else if (type === 'object') {
    resultType = {};
    for (let key in obj) {
      resultType[key] = deepClone(obj[key]);
    }
    return resultType;
  } else {
    return obj;
  }
};

export function getType(obj) {
  let toString = Object.prototype.toString;
  let typeMap = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object',
  };
  return typeMap[toString.call(obj)];
}

export const shallowCompare = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  if (getType(obj1) !== 'object' || getType(obj2) !== 'object') return false;
  let keys1 = Object.keys(obj1);
  let keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (let key of keys1) {
    if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) return false;
  }
  return true;
};
