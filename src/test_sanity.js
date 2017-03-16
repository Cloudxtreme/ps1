'use strict';

/* Really basic JavaScript tests */

const mocha = require('mocha');
const should = require('should');
const Test = mocha.Test;

describe('Test', function() {
  describe('simple math works', function() {
    it('should count to 4', function() { return 1 + 1 + 1 + 1; });
  });
});
