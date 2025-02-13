import { scheduleCallback } from 'scheduler';
import { createWorkInProgress } from './ReactFiber';
import { beginWork } from './ReactFiberBeginWork';

let workInProgress = null;

// FiberRoot
export function scheduleUpdateOnFiber(root) {
  ensureRootIsScheduled(root);
}

function ensureRootIsScheduled(root) {
  scheduleCallback(performConcurrentWorkOnRoot.bind(null, root));
}

function performConcurrentWorkOnRoot(root) {
  renderRootSync(root);
  root.finishedWork = root.current.alternate;
  // commitRoot(root);
}

function renderRootSync(root) {
  prepareFreshStack(root);
  workLoopSync();
}

function prepareFreshStack(root) {
  workInProgress = createWorkInProgress(root.current, null);
}

function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;
  const next = beginWork(current, unitOfWork);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  workInProgress = null; // TODO: Remove this assignment
  // if (next === null) {
  //   completeUnitOfWork(unitOfWork);
  // } else {
  //   workInProgress = next;
  // }
}

function completeUnitOfWork(unitOfWork) {
  // while (true) {
  //   const next = completeWork(unitOfWork);
  //   unitOfWork = next;
  //   if (unitOfWork === null) {
  //     return;
  //   }
  // }
}
