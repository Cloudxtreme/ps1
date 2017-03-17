/* Really basic JavaScript tests, to see if mocha is running */
require('should');  // side effect is to modify object with 'should' getter.

function four() {
  return 1 + 1 + 1 + 1;
}

describe('Basic Sanity Test', () => {
  describe('different ways to test', () => {
    it('should count to 4 without crashing', () => 1 + 1 + 1 + 1);
    it('should assert being calling a function', function count() {
      const assert = require('assert');
      assert(four() === 4);
    });
    it('should do the should examples', function done() {
      (5).should.be.exactly(5).and.be.a.Number();
    });
    it('should be four using BDD syntax', function done() {
      (four()).should.equal(4);
    });
    it('but to five shall thou not count', function count() {
      four().should.be.a.Number();
      (four()).should.not.equal(5);
    });
    it('should arrow function to four', () => four().should.be.exactly(4));
  });
});
