import 'should';
// import console from 'better-console';
import Ocean from './ocean';

const ocean = new Ocean();

describe('Try to ask for drops', () => {
  it('accept a listOfDrops call without a tag', () => ocean.listOfDrops().should.eventually.be.fulfilled);
  it('accept a listOfDrops with a tag', () => ocean.listOfDrops('ps1').should.eventually.be.fulfilled);
  it('should have no drops with an odd tag', () => ocean.listOfDrops('FOO9876').should.eventually.have.length(0));
});
