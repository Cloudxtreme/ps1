/* eslint-disable func-names */
import _ from 'lodash';
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


  describe('List actions', function () {
    it('should have make a report of the last items', async function shouldL() {
      const report = await ocean.prettyLastActions(5);
      d(`\n${report}`);
      (report.length > 0).should.be.true();
      (report.split('\n').should.be.length(6));
    });
  });

  describe('Test raw functionality', function () {
    it('should have transient incomplete actions', async () => {
      d(`Drops before raw\n${(await ocean.prettyListDrops())}`);

      const result = await ocean.rawCreateDrop(testTag, 'raw');
      result.should.not.be.empty();
      d(`Including action in progress\n${await ocean.prettyLastActions()}`);
      d(`Drops in progress\n${await ocean.prettyListDrops()}`);
      // ocean.prettyListDrops(testTag, 'raw').then((report) {
      //   report.split('\n').should.matchAny(/new/);
      //    d(`Including just created drop\n${report}`);
      //  });
      const actionId = _.get(result, 'body.links.actions[0].id');
      (actionId > 0).should.be.true();
      d('new drop with actionId ', actionId);
      await ocean.completeAction(actionId);
      (await ocean.prettyListDrops()).split('\n').should.not.matchAny(/new/);
    });
  });

  describe('Create and destroy drops', function () {
    it('should exterminate existing test drops and have none', async () => {
      await ocean.destroyDrops(testTag);
      ocean.listDrops(testTag).should.eventually.have.length(0);
      d(`Old ${testTag} drops exterminated`);
    });
    it('should require two arguments to create a drop', () => {
      ocean.createDrop(testTag).should.be.rejectedWith(/required/);
    });
    it('should create "simple" drop', async function () {
      const dropId = await ocean.createDrop(testTag, 'simple');
      dropId.should.be.above(0);
    });
    it('should have only one "simple" drop', async function () {
      const drops = await ocean.listDrops(testTag, 'simple');
      drops.should.have.length(1);
    });
    it('should find "simple" drop by name and tag', async function () {
      const testExp = new RegExp(testTag);
      let pretty = await ocean.prettyListDrops();
      d(`All drops after 'simple' creation drops is\n${pretty}`);
      // note that JS does not just 'match' multiline strings
      pretty.split('\n').should.matchAny(/simple/);
      pretty.split('\n').should.matchAny(testExp);
      pretty = await ocean.prettyListDrops(testExp);
      pretty.split('\n').should.matchAny(/simple/);
      pretty.split('\n').should.matchAny(testExp);
      pretty = await ocean.prettyListDrops('', 'simple');
      pretty.split('\n').should.matchAny(/simple/);
      pretty.split('\n').should.matchAny(testExp);
      pretty = await ocean.prettyListDrops(testTag, 'simple');
      pretty.split('\n').should.matchAny(/simple/);
      pretty.split('\n').should.matchAny(testExp);
    });
    it('should destroy simple drop by name');
    it('should not longer find simple drop');
    it('should create three drops, find them, delete one, and find the other two');
    it('should exterminate the drops and not find them');
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
