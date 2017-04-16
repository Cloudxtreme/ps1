/* eslint-disable func-names */

import { expect } from 'chai';
import Ocean from './ocean';
import { mochaAsync } from '../junkDrawer';

const ocean = new Ocean();

describe('List/Create/Destroy Drops', function () {
  describe('Ocean Interface', function oceanInterface() {
    describe('Try to ask for drops', function () {
      const oddTag = 'F009876';
      it('should have no drops with an odd tag',
      mochaAsync(async () => {
        const result = await ocean.listDrops(oddTag);
        expect(result).to.have.length(0);
      }));
      it('should have no pretty drops with an odd tag',
      mochaAsync(async () => {
        const result = ocean.prettyListDrops(oddTag);
        expect(result).to.match('No drops');
      }));
      it('should not crash when no tag',
      mochaAsync(async () => ocean.prettyListDrops()));
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
});
