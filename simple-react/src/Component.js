import { findDomByVNode, updateDOMTree } from './react-dom';
import { deepClone } from './utils';

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
  launchUpdate(nextProps) {
    const { ClassComponent, pendingState } = this;
    if (pendingState.length === 0 && !nextProps) return;
    let isShouldUpdate = true;

    let prevProps = deepClone(ClassComponent.props);
    let prevState = deepClone(ClassComponent.state);

    let nextState = this.pendingState.reduce((preState, newState) => {
      return { ...preState, ...newState };
    }, ClassComponent.state);

    if (ClassComponent.shouldComponentUpdate) {
      isShouldUpdate = ClassComponent.shouldComponentUpdate(
        nextProps,
        nextState
      );
    }

    ClassComponent.state = nextState;
    if (nextProps) ClassComponent.props = nextProps;
    this.pendingState.length = 0;

    if (isShouldUpdate) ClassComponent.update(prevProps, prevState);
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

  update(prevProps, prevState) {
    // 1. 获取重新执行render函数后的虚拟DOM -> 新虚拟DOM
    // 2. 根据新虚拟DOM生成真实DOM
    // 3. 将真实DOM挂在到页面上
    let oldVNode = this.oldVNode; // TODO: 让类组件拥有一个oldVNode保存类组件实例对应的虚拟DOM
    let oldDom = findDomByVNode(oldVNode); // TODO: 将真实DOM保存到对应虚拟DOM上
    if (this.constructor.getDerivedStateFromProps) {
      let newState = this.constructor.getDerivedStateFromProps(
        this.props,
        this.state
      );
      this.state = { ...this.state, ...newState };
    }

    let snapshot = this.getSnapshotBeforeUpdate
      ? this.getSnapshotBeforeUpdate(prevProps, prevState)
      : null;

    let newVNode = this.render();
    updateDOMTree(oldVNode, newVNode, oldDom);
    this.oldVNode = newVNode;
    if (this.componentDidUpdate) {
      this.componentDidUpdate(this.props, this.state, snapshot);
    }
  }
}
