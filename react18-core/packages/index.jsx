import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
let element = (
  <div>
    <div>课程名称：手写React高质量源码迈向高阶开发</div>
    <div>讲师：杨艺韬</div>
    <div>
      电子书：
      <a style={{ color: 'blue' }} href="https://www.yangyitao.com/react18">
        https://www.yangyitao.com/react18
      </a>
    </div>
  </div>
);
root.render(element);
// console.log('index.jsx', element);
