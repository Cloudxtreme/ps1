/* eslint-disable func-names */

import should from 'should';
import Ocean from './ocean';
import { mochaAsync } from '../junkDrawer';

const ocean = new Ocean();

describe('Ocean Drops Interface', function () {
  this.timeout(60000);
  this.slow(10000);
  describe('listDrops', function () {
    const oddTag = 'F009876';
    it('should have no drops with an odd tag', () =>
      ocean.listDrops().should.eventually.have.length(0));
    it('should have no pretty drops with an odd tag', () =>
      ocean.prettyListDrops(oddTag).should.eventually.match('No drops'));
    it('should not crash when no tag', ocean.prettyListDrops);
  });

  describe('exterminate/create/destroy/list cycle', function () {
    it('should exterminate existing tests and have none');
    it('should create a drop and find it');
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
