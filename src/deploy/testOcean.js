/* eslint-disable func-names */
// import _ from 'lodash';
import 'should';
import Ocean from './ocean';
import { d, ddir } from '../logging';

const ocean = new Ocean();
const testTag = 'testing';

describe('Ocean Drops Interface', function () {
  this.timeout(60000);
  this.slow(10000);

  describe('listDrops', function () {
    const oddTag = 'F009876';
    it('should have no drops with an odd tag', () =>
      ocean.listDrops(oddTag).should.eventually.have.length(0));
    it('should have no pretty drops with an odd tag', () =>
      ocean.prettyListDrops(oddTag).should.eventually.match(/No drops/));
    it('should have zero or more drops with no tag', async () => {
      const drops = await ocean.listDrops();
      const report = await ocean.prettyListDrops();
      d(`All current drops\n${report}`);
      (drops.length >= 0).should.be.true();
    });
  });
  // Could add a bunch of tests for just formatting the prettyDrops....

  describe('Can handles Create/Destroy cycle', function createDestroyCycle() {
    it('should exterminate existing test drops and have none', function step1(done) {
      ocean.destroyDrops(testTag).then(() =>
        ocean.listDrops(testTag).should.eventually.have.length(0).then(done));
    });
    it('should require two arguments to create a drop', (done) => {
      ocean.createDrop(testTag).should.be.rejectedWith(/required/)
      .catch(() => {}).then(done);
    });
    it('should create "simple" drop', function (done) {
      ocean.createDrop(testTag, 'simple')
      .then(() =>
        ocean.listDrops(testTag, 'simple').should.eventually.have.length(1))
      .then(done);
    });
    const testExp = new RegExp(testTag);
    it('should find "simple" with just tag', async function () {
      const pretty = await ocean.prettyListDrops(testTag);
      // note that JS does not just 'match' multiline strings
      pretty.split('\n').should.matchAny(/simple/);
      pretty.split('\n').should.matchAny(testExp);
    });
    it('should find "simple" with regex of test tag', async function () {
      const pretty = await ocean.prettyListDrops(testExp);
      pretty.split('\n').should.matchAny(/simple/);
      pretty.split('\n').should.matchAny(testExp);
    });
    it('should find "simple" with just tag', async function () {
      const pretty = await ocean.prettyListDrops(testTag);
      pretty.split('\n').should.matchAny(/simple/);
      pretty.split('\n').should.matchAny(testExp);
    });
    it('should find "simple" with just name', async function () {
      const pretty = await ocean.prettyListDrops('', 'simple');
      pretty.split('\n').should.matchAny(/simple/);
      pretty.split('\n').should.matchAny(testExp);
    });
    it('should find "simple" with tag and name', async function () {
      const pretty = await ocean.prettyListDrops(testTag, 'simple');
      pretty.split('\n').should.matchAny(/simple/);
      pretty.split('\n').should.matchAny(testExp);
    });
    it('should destroy simple drop by name', function destroyIt() {
      ocean.destroyDrops('', 'simple').then(() =>
         ocean.listDrops(testTag, 'simple').should.eventually.have.length(0));
    });
  });

  describe('Form basic ssh functions', function () {
    // create a drop, keeping its ip Address
    it('should find the date on the target system');
    it('should copy, list, cat, and remove a file on the target');
    it('should install packages on the the target');
    it('should create a new user and change to it');
    it('should run a command, capturing output and error');
    // destroy the drop
  });

  describe('Make a basic deployment', function () {
    it('should create a drop and get its IP address');
    it('should create a deployment environment on the target');
    it('should start the server and get the home page');
    it('should suck down the logs');
  });
});
