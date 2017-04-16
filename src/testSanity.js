/* Really basic JavaScript tests, to see if mocha is running */
/* eslint-disable func-names */
import should from 'should';

const assert = require('assert');

function four() {
  return 1 + 1 + 1 + 1;
}
function exceptFour(input) {
  // return input, but throw an error on a four.
  if (input === 4) throw new Error('four is an error');
  return input;
}

describe('Basic Sanity Tests', () => {
  describe('different ways to test', () => {
    it('should count to 4 without crashing', () => 1 + 1 + 1 + 1);
    it('should assert within a named function', function count() {
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
  describe('match should clauses correctly', () => {
    it('should check substrings', () => {
      'Good morning!'.should.match(/morning/);
      ''.should.not.match(/morning/);
    });
  });
  describe('about exceptions', function () {
    it('catch simple errors', function () {
      /* eslint-disable no-undef */
      assert.throws(() => x.y.z, ReferenceError);
      assert.throws(() => x.y.z, ReferenceError, /is not defined/);
      assert.throws(() => x.y.z, /is not defined/);
      assert.doesNotThrow(() => 3 * 4);
      assert.doesNotThrow(() => 3 * 4, ReferenceError);
      assert.doesNotThrow(() => 3 * 4, /is not defined/);
      assert.doesNotThrow(() => 3 * 4, EvalError);
      should.throws(() => x.y.z, ReferenceError);
      should.throws(() => x.y.z, ReferenceError, /is not defined/);
      should.throws(() => x.y.z, /is not defined/);
      should.doesNotThrow(() => 3 * 4);
      should.doesNotThrow(() => 3 * 4, ReferenceError);
      should.doesNotThrow(() => 3 * 4, /is not defined/);
      should.doesNotThrow(() => 3 * 4, EvalError);
    });
    it('should without chai echo', function () {
      exceptFour(3).should.equal(3);
      exceptFour('a').should.equal('a');
    });
    it('should correctly catch without chai', function () {
      assert.throws(() => exceptFour(4));
      should.throws(() => exceptFour(4));
      should.throws(() => exceptFour(4), /is an error/);
      should.throws(() => exceptFour(4), Error);
    });
  });
});
