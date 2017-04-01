import 'should';
import console from 'better-console';
import assert from 'chai';
import Ocean from './ocean';


const ocean = new Ocean();

describe('Ocean Interface', function done() {
  this.slow(5000); // slow as a dog.
  describe('Try to ask for drops', () => {
    it('accept a listOfDrops call without a tag', () => ocean.listOfDrops().should.eventually.be.fulfilled);
    it('accept a listOfDrops with a tag', () => ocean.listOfDrops('ps1').should.eventually.be.fulfilled);
    it('should have no drops with an odd tag', () => ocean.listOfDrops('FOO9876').should.eventually.have.length(0));
  });
  const testTag = `test${Math.floor((Math.random() * 100) + 100)}`;
  console.log(`Test tag is ${testTag}`);
  describe('Make an instance and destroy it', () => {
    ocean.createDrop(`Name of ${testTag}`, testTag)
    .then((response, err) => {
      it('should make a drop', assert(response && !err));
      return ocean.listOfDrops(testTag);
    })
    .then((drops, err) => {
      console.log('looking to find drop');
      it('should find that drop', assert(!err && drops.length === 1));
    })
    .catch(err => it('catch caught', () => err));
  });
});
