import console from 'better-console';
import { nodeReportUnhandledPromises } from '../src/junkDrawer';


function f1() {
  const p = Promise.reject('REJECT!');
  p.then(() => console.log('p then'));
  return p;
}

function f2() {
  const p = f1();
  const p2 = p.catch(() => console.log('p caught'));
  console.log('p2=', p2);
}

function f3() {
  nodeReportUnhandledPromises();
  f2();
  // const e = Error('message');
  // console.dir(e);
  // console.log(e.lineNumber);
}

f3();
