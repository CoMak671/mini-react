// import React from 'react';
// import ReactDOM from 'react-dom';

import React from './react';
import ReactDOM from './react-dom';

function MyFunctionComponent(props) {
  return (
    <div style={{ color: 'red' }}>
      hello simple react
      <div>child1</div>
      <div>child2</div>
    </div>
  );
}

class MyClassComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = { xxx: '999', arr: ['a', 'b', 'c', 'd', 'e'] };

    // setTimeout(() => {
    //   this.setState({ xxx: '888' });
    // }, 3000);
  }

  updateShowText(newText) {
    this.setState({ xxx: newText });
  }

  render() {
    return (
      <div style={{ color: 'red' }}>
        hello simple react
        <div>{this.props.xx}</div>
        <div onClick={() => this.updateShowText(this.state.xxx + 'a')}>
          {this.state.xxx}
        </div>
        <button
          onClick={() => this.setState({ arr: ['c', 'b', 'e', 'f', 'a'] })}
        >
          修改
        </button>
        <div>
          {this.state.arr.map((item) => {
            return <div key={item}>{item}</div>;
          })}
        </div>
      </div>
    );
  }
}

const ForwardRefFunctionComponent = React.forwardRef((props, ref) => {
  return <input ref={ref}>ForwardRefFunctionComponent</input>;
});

function FunctionComponent() {
  let forwardRef = React.createRef();
  let classRef = React.createRef();
  let elementRef = React.createRef();

  const changeInput = () => {
    forwardRef.current.value = 'ForwardRef...';
    classRef.current.updateShowText('100');
    elementRef.current.value = '...';
  };

  return (
    <div>
      <ForwardRefFunctionComponent ref={forwardRef} />
      <br />
      <input ref={elementRef} />
      <br />
      <input type="button" onClick={changeInput} value={'点击加省略号'} />
      <br />
      <MyClassComponent ref={classRef} />
      <br />
    </div>
  );
}

// ReactDOM.render(<FunctionComponent />, document.getElementById('root'));
ReactDOM.render(<MyClassComponent />, document.getElementById('root'));
