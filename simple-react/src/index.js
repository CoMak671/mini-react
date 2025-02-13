import React, {
  useState,
  useReducer,
  useEffect,
  useRef,
  useImperativeHandle,
  useMemo,
  useCallback,
} from './react';
import ReactDom from './react-dom';

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { age: state.age + 1 };
    case 'decrement':
      return { age: state.age - 1 };
    default:
      return state;
  }
}

function Counter() {
  const [count, setCount] = useState(0);
  const [state, dispatch] = useReducer(reducer, { age: 42 });

  const combine = { count };

  const memoCombine = useMemo(() => ({ count }), [count]);

  const handleClick = () => {
    setCount(count + 1);
  };

  const handleDispatch = useCallback(() => {
    dispatch({ type: 'increment' });
  }, []);

  useEffect(() => {
    console.log('effect', count);
    return () => {
      console.log('destroy', count);
    };
  }, [count]);

  return (
    <div>
      <button onClick={handleClick}>计数器++{count}</button>
      <button onClick={() => handleDispatch()}>年龄++{state.age}</button>
    </div>
  );
}

const MyInput = React.forwardRef((props, ref) => {
  const inputRef = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    },
  }));

  return <input {...props} ref={inputRef} />;
});

function Form() {
  const inputRef = useRef();
  function handleClick() {
    inputRef.current.focus();
  }
  return (
    <div>
      <MyInput ref={inputRef} />
      <button onClick={handleClick}>focus</button>
    </div>
  );
}

ReactDom.render(<Counter />, document.getElementById('root'));
