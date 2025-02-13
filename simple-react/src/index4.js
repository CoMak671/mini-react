import React from './react';
import ReactDOM from './react-dom';

class MyApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'a',
      address: '',
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('shouldComponentUpdate', nextProps, nextState);
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('componentDidUpdate', prevProps, prevState, this.state);
  }

  updateName(newName) {
    this.setState({ name: newName });
  }

  updateAddress(newAddress) {
    this.setState({ address: newAddress });
  }

  render() {
    return (
      <div>
        <label>
          Name:
          <input
            value={this.state.name}
            onInput={(e) => this.updateName(e.target.value)}
          />
        </label>
        <label>
          Address:
          <input
            value={this.state.address}
            onInput={(e) => this.updateAddress(e.target.value)}
          />
        </label>
        <Greeting name={this.state.name} />
      </div>
    );
  }
}

// class Greeting extends React.PureComponent {
//   render() {
//     console.log('Greeting render');
//     return <h1>Hello, {this.props.name}</h1>;
//   }
// }

const Greeting = function (props) {
  console.log('Greeting render', props);
  return <h1>Hello, {props.name}</h1>;
};

// const Greeting = React.memo(function (props) {
//   console.log('Greeting render', props);
//   return <h1>Hello, {props.name}</h1>;
// });

ReactDOM.render(<MyApp />, document.getElementById('root'));
