/* Really basic JavaScript tests, to see if mocha is running */
/* eslint-disable func-names */
import should from 'should';
import { expect } from 'chai';

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
  describe('about testing exceptions', function () {
    /* eslint-disable no-undef */
    it('node assert should catch simple errors', function () {
      assert.throws(() => x.y.z, ReferenceError);
      assert.throws(() => x.y.z, ReferenceError, /is not defined/);
      assert.throws(() => x.y.z, /is not defined/);
      assert.throws(() => x.y.z, Error);
      assert.doesNotThrow(() => 3 * 4);
      assert.doesNotThrow(() => 3 * 4, ReferenceError);
      assert.doesNotThrow(() => 3 * 4, /is not defined/);
      assert.doesNotThrow(() => 3 * 4, EvalError);
    });
    it('should library should catch simple errors', function () {
      should.throws(() => x.y.z, ReferenceError);
      should.throws(() => x.y.z, ReferenceError, /is not defined/);
      should.throws(() => x.y.z, /is not defined/);
      should.doesNotThrow(() => 3 * 4);
      should.doesNotThrow(() => 3 * 4, ReferenceError);
      should.doesNotThrow(() => 3 * 4, /is not defined/);
      should.doesNotThrow(() => 3 * 4, EvalError);
    });
    it('chai expect should catch simple errors', function () {
      expect(() => x.y.z).to.throw();
      expect(() => x.y.z).to.throw(ReferenceError);
      expect(() => x.y.z).to.throw(ReferenceError, /is not defined/);
      expect(() => x.y.z).to.throw(/is not defined/);
      expect(() => 42).not.to.throw();
      expect(() => x.y.z).to.throw(Error);
      // expect(() => x.y.z).to.throw(ReferenceError).and.not.throw(/Property/);
    });

    it('should handle escaped errors', function () {
      try {
        expect(() => x.y.z).not.to.throw(RangeError);
      } catch (err) {
        expect(err).to.be.a(ReferenceError);
      }
    });
    it('FAILS on exception', function () {
      let err;
      try {
        exceptFour(4).should.equal(4);
      } catch (e) {
        err = e;
      }
      expect(err).to.match(/is an error/);
    });
    it('should correctly catch without chai', function () {
      assert.throws(() => exceptFour(4));
      should.throws(() => exceptFour(4));
      should.throws(() => exceptFour(4), /is an error/);
      should.throws(() => exceptFour(4), Error);
    });
  });
});
