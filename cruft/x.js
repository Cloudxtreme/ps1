import console from 'better-console';
import { nodeReportUnhandledPromises, wait, line } from '../src/junkDrawer';

function pro(...params) {
  // return a new Prolog promise,
  // call like:  `pro().then(thing)...`;
  return new Prolog(...params);
}

let nextId = 1;
let nextGroup = 0;
const groupIds = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function proOut(msg) {
  console.log('prolog: ', msg);
}

class Prolog {
  constructor(p, group, text) {
    this.p = p || Promise.resolve('no argument');
    if (group) {
      this.group = group || '';
    } else {
      this.group = groupIds[nextGroup];
      nextGroup += 1;
    }
    this.id = this.group + nextId.toString();
    nextId += 1;
    if (group) {
      proOut(`${text}${this.id}`);
    } else if (p) {
      proOut(`new ${this.id} chain from argument`);
    } else {
      proOut(`new ${this.id} chain`);
    }
  }

  then(...params) {
    const p1 = this.p.then(...params);
    const p2 = pro(p1, this.group, `(${this.id}).then new `);
    p1.then(
      () => { proOut(`${p2.id} fulfills`); },
      () => { proOut(`${p2.id} rejects`); });
    return p2;
  }

  catch(...params) {
    const p1 = this.p.catch(...params);
    const p2 = pro(p1, this.group, `(${this.id}).catch new `);
    p1.then(
      () => { proOut(`${p2.id} fulfills`); },
      () => { proOut(`${p2.id} rejects`); });
    return p2;
  }
}


function f5() {
  pro().then(() => wait(1000)).then(() => wait(500)).then(() => 'done');
  console.log('2......');
  pro(wait(1200)).then(() => wait(500));
}

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

console.log(Array(5).join(line('=')));
f5();
