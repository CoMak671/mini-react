// import React from 'react';
// import ReactDOM from 'react-dom';

import React from './react';
import ReactDOM from './react-dom';

class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = { date: new Date() };
  }

  // 1.组件挂载到页面之后调用
  // 2.需要依赖真实DOM节点的相关初始化操作放在这里
  // 3.适合加载数据
  // 4.适合事件订阅
  // 5.不适合调用setState
  componentDidMount() {
    console.log('componentDidMount');
    this.timerID = setInterval(() => this.tick(), 1000);
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('shouldComponentUpdate');
    return false;
  }

  // 1.更新完成后调用，初始化渲染不会调用
  // 2.当组件更新完成，需要对DOM进行某种操作的时候
  // 3.当前的prop跟之前不同，可以进行有必要的网络请求
  // 4.有条件调用setState，否则会死循环
  // 5.shouldComponentUpdate返回false，componentDidUpdate不执行
  // 6.如果getSnapshotBeforeUpdate有返回，会传递到componentDidUpdate的snapshot参数
  // 7.如果props内容拷贝到state，可以考虑直接使用props
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdate');
  }

  // 1.组件从DOM卸载完成前调用
  // 2.执行清理操作：定时器、事件订阅
  // 3.不执行setState
  componentWillUnmount() {
    console.log('componentWillUnmount');
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({
      date: new Date(),
    });
  }

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    );
  }
}

class ParentClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { id: 'zhangsanfeng' };
  }

  changeUserId() {
    this.setState({ id: 'lisi' + Math.random() });
  }

  render() {
    return (
      <div>
        <input
          type="button"
          value="点击改变UserId"
          onClick={() => this.changeUserId()}
        />
        <DerivedState userId={this.state.id} />
      </div>
    );
  }
}

class DerivedState extends ParentClass {
  constructor(props) {
    super(props);
    this.state = { prevUserId: 'zhangsanfeng', email: 'zhangsanfeng@xx.com' };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.userId !== prevState.prevUserId) {
      return {
        prevUserId: nextProps.userId,
        email: nextProps.userId + '@xx.com',
      };
    }
  }

  render() {
    return (
      <div>
        <h1>Email:</h1>
        <h2>{this.state.email}</h2>
      </div>
    );
  }
}

class ScrollingList extends React.Component {
  isAppend = true;
  count = 0;
  intervalId;
  constructor(props) {
    super(props);
    this.listRef = React.createRef();
    this.state = { list: [] };
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    // Are we adding new items to the list?
    // Capture the scroll position so we can adjust scroll later.
    if (prevState.list.length < this.state.list.length) {
      const list = this.listRef.current;
      return list.scrollHeight - list.scrollTop;
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // If we have a snapshot value, we've just added new items.
    // Adjust scroll so these new items don't push the old ones out of view.
    // (snapshot here is the value returned from getSnapshotBeforeUpdate)
    if (snapshot !== null) {
      const list = this.listRef.current;
      list.scrollTop = list.scrollHeight - snapshot;
    }
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  appendData = () => {
    if (this.isAppend) {
      this.intervalId = setInterval(() => {
        this.setState({
          list: [...this.state.list, this.count++],
        });
      }, 1000);
    } else {
      clearInterval(this.intervalId);
    }
    this.isAppend = !this.isAppend;
  };

  render() {
    return (
      <div>
        <input
          type="button"
          value="点击添加"
          onClick={() => this.appendData()}
        />
        <div
          ref={this.listRef}
          style={{ overflow: 'auto', height: '400px', background: '#efefef' }}
        >
          {this.state.list.map((item) => {
            return (
              <div
                key={item}
                style={{
                  height: '50px',
                  padding: '10px',
                  borderBottom: '1px solid #ccc',
                }}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

ReactDOM.render(<ScrollingList />, document.getElementById('root'));
