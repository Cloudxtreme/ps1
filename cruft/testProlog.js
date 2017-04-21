import { pro } from './prolog';
import { wait } from '../src/junkDrawer';

describe('Prolog should pass smoke test', function () {
  it('should not crash', function () {
    this.timeout(5000);
    pro().then(() => wait(1000)).then(() => wait(500)).then(() => 'done');
    pro(wait(1200)).then(() => wait(500)).catch(() => console.log('wait'));
  });
  it('should not have unhandled catch', function () {
    pro().then(() => Promise.reject('foo')).catch(f => console.log('foo is ', f));
  });
  it('should deal with promise as argument', function () {
    this.timeout(1000);
    pro(wait(10)).then(() => wait(15), () => wait(10));
  });
});
