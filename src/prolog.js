import { nodeReportUnhandledPromises } from './junkDrawer';

export function proOut(msg) {
  console.log('prolog: ', msg);
  const e = Error('proOut not error');
  const l = e.stack.split('\n');
  let m;
  for (let i = 1; i < l.length; i += 1) {
    m = l[i].match('/src/.*');
    if (m && !l[i].match('prolog')) { break; }
  }
  console.log('prolog: ', msg, (m && m.toString()) || '');
}

// These are outside the class because JS standardization twits won't make
// class statics correctly.

let nextId = 1;
let nextGroup = 0;
const groupIds = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function pro(...params) {
  // return a new Prolog promise,
  // call like:  `pro().then(thing)...`;
  return new Prolog(...params);
}

export class Prolog {
  constructor(p, group, text) {
    this.p = p || Promise.resolve('base prolog promise');
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
    // only if created from argument, watch for resolution.
    if (p) {
      p.then(
        () => { proOut(`${this.id} fulfills`); },
        (r) => { proOut(`${this.id} rejects 1:${r}`); },
      );
    }
  }

  then(...params) {
    const p1 = this.p.then(...params);
    const p2 = pro(p1, this.group, `(${this.id}).then new `);
    p1.then(
      () => { proOut(`${p2.id} fulfills`); },
      (r) => { proOut(`${p2.id} rejects 2:${r}`); });
    return p2;
  }

  catch(...params) {
    const p1 = this.p.catch(...params);
    const p2 = pro(p1, this.group, `(${this.id}).catch new `);
    p1.then(() => { proOut(`${p2.id} fulfills`); })
    .catch(() => { proOut(`${p2.id} rejects`); });
    p1.then(
         () => { proOut(`${p2.id} fulfills`); },
         (r) => { proOut(`${p2.id} rejects 3:${r}`); });
    return p2;
  }
}

nodeReportUnhandledPromises();
