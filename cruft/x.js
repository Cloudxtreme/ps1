import console from 'better-console';
import { nodeReportUnhandledPromises, wait, poll } from '../src/junkDrawer';
import d from '../src/logging';

function dp(p = undefined) {
  // return a new debuggable promise,
  // call like:  `dp().then(thing)...`;
  return new DebugPromise(p);
}

let nextId = 100;
const plist = {};

function hprint(id) {
  console.log('%d | %s | ', id, plist[id].history, plist[id].pobj);
}

class DebugPromise {
  constructor(p = undefined) {
    this.p = p || Promise.resolve('no argument');
    this.id = nextId;
    plist[nextId] = { history: `created ${nextId}`, pobj: this.p };
    nextId += 1;
    hprint(this.id);
  }

  then(...params) {
    d(`in then for ${this.id}`);
    const p2 = dp(this.p.then(...params));
    plist[this.id].history = `resolved in then, making ${p2.id}`;
    console.dir(plist[this.id]);
    hprint(this.id);
    return p2;
  }

  catch(...params) {
    const p2 = dp(this.p.catch(...params));
    plist[this.id].history = `resolved in catch, making ${p2.id}`;
    hprint(this.id);
    return dp(this.p.catch(...params));
  }
}


function f5() {
  dp().then(() => wait(1000)).then(() => wait(500));
  console.log('2......');
  dp(wait(1200)).then(() => wait(500));
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

f5();
