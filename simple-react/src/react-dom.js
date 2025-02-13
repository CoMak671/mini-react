import { addEvent } from './event';
import {
  REACT_ELEMENT,
  REACT_FORWARD_REF,
  REACT_TEXT,
  CREATE,
  MOVE,
  REACT_MEMO,
  shallowCompare,
} from './utils';
import { resetHookIndex } from './hooks';

export let emitUpdateForHooks;

function render(VNode, containerDOM) {
  // 虚拟DOM转化成真实DOM
  // 将得到的真实DOM挂在到container
  mount(VNode, containerDOM);
  emitUpdateForHooks = () => {
    resetHookIndex();
    updateDOMTree(VNode, VNode, containerDOM);
  };
}

function mount(VNode, containerDOM) {
  let newDom = createDOM(VNode);
  newDom && containerDOM.appendChild(newDom);
  // TODO: componentDidMount实际改在这里调用，不知道什么原因（简化代码？）改在getDomByClassComponent中
}

function mountArray(children, parent) {
  if (!Array.isArray(children)) return;
  for (let i = 0; i < children.length; i++) {
    const element = children[i];
    children[i].index = i;
    mount(element, parent);
  }
}

function createDOM(VNode) {
  // 1.创建元素 2.创建子元素 3.处理属性值
  const { type, props, ref } = VNode;
  let dom;

  if (type && type.$$typeof === REACT_MEMO) {
    return getDomByMemoFunctionComponent(VNode);
  }

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
  if (type === REACT_TEXT) {
    dom = document.createTextNode(props.text);
  } else if (type && VNode.$$typeof === REACT_ELEMENT) {
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
  VNode.oldRenderVNode = renderVNode;
  let dom = createDOM(renderVNode);
  VNode.dom = dom;
  return dom;
}

function getDomByMemoFunctionComponent(VNode) {
  let { type, props } = VNode;
  let renderVNode = type.type(props);
  if (!renderVNode) return null;
  VNode.oldRenderVNode = renderVNode;
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
  VNode.classInstance = instance;
  ref && (ref.current = instance);
  if (!renderVNode) return null;
  let dom = createDOM(renderVNode);
  if (instance.componentDidMount) {
    instance.componentDidMount();
  }
  return dom;
}

export function findDomByVNode(VNode) {
  if (!VNode) return;
  if (VNode.dom) return VNode.dom;
}

export function updateDOMTree(oldVNode, newVNode, oldDOM) {
  // let parentNode = oldDOM.parentNode;
  // parentNode.removeChild(oldDOM);
  // parentNode.appendChild(createDOM(newVNode));

  // 新节点，旧节点都不存在
  // 新节点存在，旧节点都不存在
  // 新节点不存在，旧节点存在
  // 新节点存在，旧节点也存在，但是类型不一样
  // 新节点存在，旧节点也存在，类型也一样 --> 深入比较，探索复用相关节点方案
  const typeMap = {
    NO_OPERATE: !oldVNode && !newVNode,
    ADD: !oldVNode && newVNode,
    DELETE: oldVNode && !newVNode,
    REPLACE: oldVNode && newVNode && oldVNode.type !== newVNode.type,
  };
  const UPDATE_TYPE = Object.keys(typeMap).filter((key) => typeMap[key])[0];
  switch (UPDATE_TYPE) {
    case 'NO_OPERATE':
      break;
    case 'DELETE':
      removeVNode(oldVNode);
      break;
    case 'ADD':
      oldDOM.parentNode.appendChild(createDOM(newVNode));
      break;
    case 'REPLACE':
      removeVNode(oldVNode);
      oldDOM.parentNode.appendChild(createDOM(newVNode));
      break;
    default:
      // 新节点存在，旧节点也存在，类型也一样
      deepDOMDiff(oldVNode, newVNode);
      break;
  }
}

function removeVNode(VNode) {
  const currentDOM = findDomByVNode(VNode);
  if (currentDOM) currentDOM.remove();
  if (VNode.classInstance && VNode.classInstance.componentWillUnmount) {
    VNode.classInstance.componentWillUnmount();
  }
}

function deepDOMDiff(oldVNode, newVNode) {
  const diffTypeMap = {
    ORIGIN_NODE: typeof oldVNode.type === 'string',
    CLASS_COMPONENT:
      typeof oldVNode.type === 'function' && oldVNode.type.IS_CLASS_COMPONENT,
    FUNCTION_COMPONENT: typeof oldVNode.type === 'function',
    TEXT: oldVNode.type === REACT_TEXT,
    MEMO: oldVNode.type.$$typeof === REACT_MEMO,
  };
  const DIFF_TYPE = Object.keys(diffTypeMap).filter(
    (key) => diffTypeMap[key]
  )[0];
  switch (DIFF_TYPE) {
    case 'ORIGIN_NODE':
      const currentDOM = (newVNode.dom = findDomByVNode(oldVNode));
      setPropsForDom(currentDOM, newVNode.props);
      updateChildren(
        currentDOM,
        oldVNode.props.children,
        newVNode.props.children
      );
      break;
    case 'CLASS_COMPONENT':
      updateClassComponent(oldVNode, newVNode);
      break;
    case 'FUNCTION_COMPONENT':
      updateFunctionComponent(oldVNode, newVNode);
      break;
    case 'TEXT':
      newVNode.dom = findDomByVNode(oldVNode);
      newVNode.dom.textContent = newVNode.props.text;
      break;
    case 'MEMO':
      updateMemoFunctionComponent(oldVNode, newVNode);
      break;
    default:
      break;
  }
}

function updateClassComponent(oldVNode, newVNode) {
  const classInstance = (newVNode.classInstance = oldVNode.classInstance);
  classInstance.updater.launchUpdate(newVNode.props);
}

function updateFunctionComponent(oldVNode, newVNode) {
  const oldDOM = findDomByVNode(oldVNode);
  newVNode.dom = oldDOM;
  if (!oldDOM) return;
  const { type, props } = newVNode;
  const newRenderVNode = type(props);
  updateDOMTree(oldVNode.oldRenderVNode, newRenderVNode, oldDOM);
  newVNode.oldRenderVNode = newRenderVNode;
}

function updateMemoFunctionComponent(oldVNode, newVNode) {
  let { type } = oldVNode;
  if (
    (!type.compare && !shallowCompare(oldVNode.props, newVNode.props)) ||
    (type.compare && !type.compare(oldVNode.props, newVNode.props))
  ) {
    const oldDOM = findDomByVNode(oldVNode);
    const { type, props } = newVNode;
    const newRenderVNode = type.type(props);
    updateDOMTree(oldVNode.oldRenderVNode, newRenderVNode, oldDOM);
    newVNode.oldRenderVNode = newRenderVNode;
  } else {
    newVNode.oldRenderVNode = oldVNode.oldRenderVNode;
  }
}

// diff算法核心
function updateChildren(parentDOM, oldVNodeChildren, newVNodeChildren) {
  oldVNodeChildren = (
    Array.isArray(oldVNodeChildren) ? oldVNodeChildren : [oldVNodeChildren]
  ).filter(Boolean);
  newVNodeChildren = (
    Array.isArray(newVNodeChildren) ? newVNodeChildren : [newVNodeChildren]
  ).filter(Boolean);

  let lastNotChangedIndex = -1;
  let oldKeyChildMap = {};
  oldVNodeChildren.forEach((oldVNode, index) => {
    let oldKey = oldVNode && oldVNode.key ? oldVNode.key : index;
    oldKeyChildMap[oldKey] = oldVNode;
  });
  // 遍历新的子虚拟DOM数组，找到可以复用但需要移动的节点，需要重新创建的节点，需要删除的节点，剩下就是可以复用且不用移动的节点
  const actions = [];
  newVNodeChildren.forEach((newVNode, index) => {
    newVNode.index = index;
    let newKey = newVNode && newVNode.key ? newVNode.key : index;
    const oldVNode = oldKeyChildMap[newKey];
    if (oldVNode) {
      deepDOMDiff(oldVNode, newVNode);
      if (oldVNode.index < lastNotChangedIndex) {
        actions.push({
          type: MOVE,
          oldVNode,
          newVNode,
          index,
        });
      }
      delete oldKeyChildMap[newKey];
      lastNotChangedIndex = Math.max(lastNotChangedIndex, oldVNode.index);
    } else {
      actions.push({
        type: CREATE,
        newVNode,
        index,
      });
    }
  });
  const VNodeToMove = actions
    .filter((action) => action.type === MOVE)
    .map((action) => action.oldVNode);
  const VNodeToDelete = Object.values(oldKeyChildMap);
  VNodeToMove.concat(VNodeToDelete).forEach((oldVNode) => {
    const currentDOM = findDomByVNode(oldVNode);
    currentDOM.remove();
  });
  actions.forEach((action) => {
    const { type, oldVNode, newVNode, index } = action;
    const childNodes = parentDOM.childNodes;
    const childNode = childNodes[index];
    const getDomForInsert = () => {
      if (type === CREATE) {
        return createDOM(newVNode);
      }
      if (type === MOVE) {
        return findDomByVNode(oldVNode);
      }
    };
    if (childNode) {
      parentDOM.insertBefore(getDomForInsert(), childNode);
    } else {
      parentDOM.appendChild(getDomForInsert());
    }
  });
}

const ReactDOM = {
  render,
};

export default ReactDOM;
