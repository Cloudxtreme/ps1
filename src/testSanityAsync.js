// Check that async tests work as expected.
/* eslint-disable func-names */
import should from 'should';
import { wait } from './junkDrawer';

async function exceptFive(value, delay = 10) {
  const v = await wait(delay, value);
  if (value === 5) {
    throw new Error('five is an error');
  }
  return v;
}

describe('Async Sanity Tests', () => {
  it('should call async without crashing', async () => exceptFive(1));
  it('should check return value from async', async () =>
      (await exceptFive(2)).should.equal(2));
  it('should use long function syntax', async function () {
    return (await exceptFive(3)).should.equal(3);
  });
  it('should function as a promise', () =>
      exceptFive(4).should.eventually.equal(4));
  it('should see a promise rejection', () =>
      exceptFive(5).should.be.rejected());
  it('should see a promise rejection with rejectedWith', () =>
      exceptFive(5).should.be.rejectedWith(/is an error/));
  it('should handle a one second test', async () =>
      (await exceptFive(4, 1000)).should.equal(4));
  it('should handle a five second test', async function () {
    this.slow(6000);
    exceptFive(9, 5000);
  });
  it('should handle a five second test', async function () {
    this.timeout(6000);
    return exceptFive(9, 5000);
  });
  it('should handle a five second rejection', async function () {
    this.timeout(6000);
    exceptFive(5, 5000).should.be.rejectedWith(/is an error/);
  });
  // So, it looks like really waiting for an exception is hard.
});
