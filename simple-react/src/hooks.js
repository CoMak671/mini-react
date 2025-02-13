import { emitUpdateForHooks } from './react-dom';

let states = []; // 数据池
let hookIndex = 0;

export function resetHookIndex() {
  hookIndex = 0;
}

export function useState(initialValue) {
  states[hookIndex] = states[hookIndex] || initialValue;
  const currentHookIndex = hookIndex;
  function setState(newState) {
    states[currentHookIndex] = newState;
    emitUpdateForHooks();
  }
  return [states[hookIndex++], setState];
}

export function useReducer(reducer, initialState) {
  states[hookIndex] = states[hookIndex] || initialState;
  const currentHookIndex = hookIndex;
  function dispatch(action) {
    states[currentHookIndex] = reducer(states[currentHookIndex], action);
    emitUpdateForHooks();
  }
  return [states[hookIndex++], dispatch];
}

export function useEffect(effectFunction, deps) {
  const currentHookIndex = hookIndex;
  const [destroyFunction, preDeps] = states[currentHookIndex] || [null, null];
  if (!states[hookIndex] || deps.some((dep, index) => dep !== preDeps[index])) {
    // 宏任务 为了模拟React的异步更新，这里使用setTimeout
    setTimeout(() => {
      if (destroyFunction) {
        destroyFunction();
      }
      states[currentHookIndex] = [effectFunction(), deps];
    }, 0);
  }
  hookIndex++;
}

export function useLayoutEffect(effectFunction, deps) {
  const currentHookIndex = hookIndex;
  const [destroyFunction, preDeps] = states[currentHookIndex] || [null, null];
  if (!states[hookIndex] || deps.some((dep, index) => dep !== preDeps[index])) {
    // 微任务
    queueMicrotask(() => {
      if (destroyFunction) {
        destroyFunction();
      }
      states[currentHookIndex] = [effectFunction(), deps];
    }, 0);
  }
  hookIndex++;
}

export function useRef(initialValue) {
  states[hookIndex] = states[hookIndex] || { current: initialValue };
  return states[hookIndex++];
}

export function useImperativeHandle(ref, dataFactory) {
  ref.current = dataFactory();
}

export function useMemo(dataFactory, deps = []) {
  const [preData, preDeps] = states[hookIndex] || [null, null];
  if (!states[hookIndex] || deps.some((dep, index) => dep !== preDeps[index])) {
    const newData = dataFactory();
    states[hookIndex++] = [newData, deps];
    return newData;
  }
  hookIndex++;
  return preData;
}

export function useCallback(callback, deps = []) {
  const [preCallback, preDeps] = states[hookIndex] || [null, null];
  if (!states[hookIndex] || deps.some((dep, index) => dep !== preDeps[index])) {
    states[hookIndex++] = [callback, deps];
    return callback;
  }
  hookIndex++;
  return preCallback;
}
