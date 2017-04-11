import console from 'better-console';
import { nodeReportUnhandledPromises, wait, line } from '../src/junkDrawer';
// import d from '../src/logging';

function dp(...params) {
  // return a new debuggable promise,
  // call like:  `dp().then(thing)...`;
  return new DebugPromise(...params);
}

let nextId = 1;
let nextGroup = 0;
const groupIds = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const plist = {};


function hp(msg) {
  console.log('prolog: ', msg);
  // set to history?
}

class DebugPromise {
  constructor(p, group, text) {
    this.p = p || Promise.resolve('no argument');
    if (group) {
      this.group = group || '';
    } else {
      this.group = groupIds[nextGroup];
      nextGroup += 1;
    }
    this.id = this.group + nextId.toString();
    if (group) {
      hp(`${text}${this.id}`);
    } else if (p) {
      hp(`new ${this.id} chain from argument`);
    } else {
      hp(`new ${this.id} chain`);
    }
    plist[this.id] = { pobj: this.p, group: this.group };
    nextId += 1;
    // hprint(this.id);
  }

  then(...params) {
    const p1 = this.p.then(...params);
    const p2 = dp(p1, this.group, `(${this.id}).then new `);
    plist[this.id].history = `then -> ${p2.id}`;
    p1.then(
      () => { hp(`${p2.id} fulfills`); },
      () => { hp(`${p2.id} rejects`); });
    return p2;
  }

  catch(...params) {
    const p1 = this.p.catch(...params);
    const p2 = dp(p1, this.group, `(${this.id}).catch new `);
    plist[this.id].history = `catch ->  ${p2.id}`;
    p1.then(
      () => { hp(`${p2.id} fulfills`); },
      () => { hp(`${p2.id} rejects`); });
    return p2;
  }
}


function f5() {
  dp().then(() => wait(1000)).then(() => wait(500)).then(() => 'done');
  console.log('2......');
  dp(wait(1200)).then(() => wait(500));
  // wait(5000).then(hprint);
  //  hprint();
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
