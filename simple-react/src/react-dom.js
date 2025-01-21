import { addEvent } from './event';
import { REACT_ELEMENT, REACT_FORWARD_REF } from './utils';

function render(VNode, containerDOM) {
  // 虚拟DOM转化成真实DOM
  // 将得到的真实DOM挂在到container
  mount(VNode, containerDOM);
}

function mount(VNode, containerDOM) {
  let newDom = createDOM(VNode);
  newDom && containerDOM.appendChild(newDom);
}

function mountArray(children, parent) {
  if (!Array.isArray(children)) return;
  for (let i = 0; i < children.length; i++) {
    const element = children[i];
    if (typeof element === 'string') {
      parent.appendChild(document.createTextNode(element));
    } else {
      mount(element, parent);
    }
  }
}

function createDOM(VNode) {
  // 1.创建元素 2.创建子元素 3.处理属性值
  const { type, props, ref } = VNode;
  let dom;

  if (type && type.$$typeof === REACT_FORWARD_REF) {
    return getDomByForwardRefFunction(VNode);
  }
  if (
    typeof type === 'function' &&
    VNode.$$typeof === REACT_ELEMENT &&
    type.IS_CLASS_COMPONENT
  ) {
    return getDomByClassComponent(VNode);
  }
  if (typeof type === 'function' && VNode.$$typeof === REACT_ELEMENT) {
    return getDomByFunctionComponent(VNode);
  }
  if (type && VNode.$$typeof === REACT_ELEMENT) {
    dom = document.createElement(type);
  }
  if (props) {
    if (typeof props.children === 'object' && props.children.type) {
      mount(props.children, dom);
    } else if (Array.isArray(props.children)) {
      mountArray(props.children, dom);
    } else if (typeof props.children === 'string') {
      dom.appendChild(document.createTextNode(props.children));
    }
  }

  // 设置属性值
  setPropsForDom(dom, props);
  // 将真实DOM记录在虚拟DOM上
  VNode.dom = dom;
  ref && (ref.current = dom);
  return dom;
}

function setPropsForDom(dom, VNodeProps) {
  if (!dom) return;
  for (const key in VNodeProps) {
    if (key === 'children') continue;
    if (/^on[A-Z].*/.test(key)) {
      addEvent(dom, key.toLowerCase(), VNodeProps[key]);
    } else if (key === 'style') {
      Object.keys(VNodeProps[key]).forEach((styleName) => {
        dom.style[styleName] = VNodeProps[key][styleName];
      });
    } else {
      dom[key] = VNodeProps[key];
    }
  }
}

function getDomByFunctionComponent(VNode) {
  let { type, props } = VNode;
  let renderVNode = type(props);
  if (!renderVNode) return null;
  return createDOM(renderVNode);
}

function getDomByForwardRefFunction(VNode) {
  let { type, props, ref } = VNode;
  let renderVNode = type.render(props, ref);
  if (!renderVNode) return null;
  return createDOM(renderVNode);
}

function getDomByClassComponent(VNode) {
  let { type, props, ref } = VNode;
  let instance = new type(props);
  let renderVNode = instance.render();
  // TODO
  instance.oldVNode = renderVNode;
  ref && (ref.current = instance);
  if (!renderVNode) return null;
  return createDOM(renderVNode);
}

export function findDomByVNode(VNode) {
  if (!VNode) return;
  if (VNode.dom) return VNode.dom;
}

export function updateDOMTree(oldDOM, newVNode) {
  let parentNode = oldDOM.parentNode;
  parentNode.removeChild(oldDOM);
  parentNode.appendChild(createDOM(newVNode));
}

const ReactDOM = {
  render,
};

export default ReactDOM;
