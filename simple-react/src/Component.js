import { findDomByVNode, updateDOMTree } from './react-dom';

export const updaterQueue = {
  isBatch: false,
  updaters: new Set(),
};
export function flushUpdaterQueue() {
  updaterQueue.isBatch = false;
  for (const updater of updaterQueue.updaters) {
    updater.launchUpdate();
  }
  updaterQueue.updaters.clear();
}

class Updater {
  constructor(ClassComponent) {
    this.ClassComponent = ClassComponent;
    this.pendingState = [];
  }
  addState(partialState) {
    this.pendingState.push(partialState);
    this.preHandleForUpdate();
  }
  preHandleForUpdate() {
    if (updaterQueue.isBatch) {
      updaterQueue.updaters.add(this);
    } else {
      this.launchUpdate();
    }
  }
  launchUpdate() {
    const { ClassComponent, pendingState } = this;
    if (pendingState.length === 0) return;
    ClassComponent.state = this.pendingState.reduce((preState, newState) => {
      return { ...preState, ...newState };
    }, ClassComponent.state);
    this.pendingState.length = 0;
    ClassComponent.update();
  }
}

export class Component {
  static IS_CLASS_COMPONENT = true;
  constructor(props) {
    this.updater = new Updater(this);
    this.state = {};
    this.props = props;
  }
  setState(partialState) {
    // 1. 合并属性
    // this.setState(...this.state, ...partialState);
    // 2. 重新渲染进行更新
    // this.update();

    this.updater.addState(partialState);
  }

  update() {
    // 1. 获取重新执行render函数后的虚拟DOM -> 新虚拟DOM
    // 2. 根据新虚拟DOM生成真实DOM
    // 3. 将真实DOM挂在到页面上
    let oldVNode = this.oldVNode; // TODO: 让类组件拥有一个oldVNode保存类组件实例对应的虚拟DOM
    let oldDom = findDomByVNode(oldVNode); // TODO: 将真实DOM保存到对应虚拟DOM上
    let newVNode = this.render();
    updateDOMTree(oldDom, newVNode);
    this.oldVNode = newVNode;
  }
}
