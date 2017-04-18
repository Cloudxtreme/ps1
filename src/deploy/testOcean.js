/* eslint-disable func-names */

import _ from 'lodash';
import 'should';
import Ocean from './ocean';
import { d } from '../logging';

const ocean = new Ocean();
const testTag = 'testing';

describe('Ocean Drops Interface', function () {
  this.timeout(60000);
  this.slow(10000);
  describe('listDrops', function () {
    const oddTag = 'F009876';
    it('should have no drops with an odd tag', () =>
      ocean.listDrops().should.eventually.have.length(0));
    it('should have no pretty drops with an odd tag', () =>
      ocean.prettyListDrops(oddTag).should.eventually.match(/No drops/));
    it('should have zero or more drops with no tag', async () => {
      const drops = await ocean.listDrops();
      const report = await ocean.prettyListDrops();
      d(`\n${report}`);
      // d('drops', drops);
      (drops.length >= 0).should.be.true();
    });
    it('should have transient incomplete actions', async () => {
      d(`\n${(await ocean.prettyListDrops())}`);
      d('...A');
      const result = await ocean.rawCreateDrop(testTag, 'raw');
      d('...C');
      d(`\n${(await ocean.prettyListDrops())}`);
      d('...D');
      const actionId = _.get(result, 'body.links.actions[0].id');
      d('action id of new drop is', actionId);
      await ocean.completeAction(actionId);
      d(`\n${(await ocean.prettyListDrops())}`);
    });
  });

  describe('Simple create/destroy cycle', function () {
    it('should exterminate existing test drops and have none', async () => {
      d('ready to destroy drops');
      await ocean.destroyDrops(testTag);
      // ocean.listDrops().should.eventually.have.length(0);
    });
    it('should require two arguments to create a drop', () => {
      ocean.createDrop(testTag).should.be.rejectedWith(/required/);
    });
    it('should create a drop and find it', async function () {
      await ocean.createDrop(testTag, 'simple');
      d('back from create');
      const pretty = await ocean.prettyListDrops();
      d('this is pretty');
      d(pretty);
      const drops = await ocean.listDrops();
      d('Testing create, drops returned is', drops);
      drops.should.have.length(1);
      _.get(drops, '.name').should.equal('simple');
    });
    it('should destroy a drop and not find it');
    it('should create a drop and find it');
    it('should exterminate the drop and not find it');
  });
  describe('create/create/create/destroy/exterminate', function () {
    it('should create several drops and find them');
    it('should destroy the middle drop');
    it('should exterminate the remaining drops');
  });
});
