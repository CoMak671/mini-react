import {
  REACT_ELEMENT,
  REACT_FORWARD_REF,
  REACT_MEMO,
  toVNode,
  shallowCompare,
} from './utils';
import { Component } from './Component';
export * from './hooks';

function createElement(type, properties, children) {
  let ref = properties.ref || null;
  let key = properties.key || null;
  ['ref', 'key', '__self', '__source'].forEach((key) => delete properties[key]);
  let props = { ...properties };
  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2).map(toVNode);
  } else {
    props.children = toVNode(children);
  }
  return {
    $$typeof: REACT_ELEMENT,
    type,
    ref,
    key,
    props,
  };
}

function createRef() {
  return { current: null };
}

function forwardRef(render) {
  return {
    $$typeof: REACT_FORWARD_REF,
    render,
  };
}

class PureComponent extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return (
      !shallowCompare(this.props, nextProps) ||
      !shallowCompare(this.state, nextState)
    );
  }
}

function memo(type, compare) {
  return {
    $$typeof: REACT_MEMO,
    type,
    compare,
  };
}

const React = {
  createElement,
  Component,
  PureComponent,
  createRef,
  forwardRef,
  memo,
};

export default React;
