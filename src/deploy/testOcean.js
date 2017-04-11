import 'should';
import console from 'better-console';
import assert from 'chai';
import Ocean from './ocean';


const ocean = new Ocean();

describe('Ocean Interface', function oceanInterface() {
  describe('Try to ask for drops', function tryList() {
    it('accept a listOfDrops call without a tag', () => ocean.listOfDrops().should.eventually.be.fulfilled);
    it('accept a listOfDrops with a tag', () => ocean.listOfDrops('ps1').should.eventually.be.fulfilled);
    it('should have no drops with an odd tag', () => ocean.listOfDrops('FOO9876').should.eventually.have.length(0));
  });

  describe('Try to ask for a pretty list of drops', function prettyDropTest() {
    it('accept a call without a tag', () => ocean.prettyListOfDrops().should.eventually.be.fulfilled);
    it('accept a call with a tag', () => ocean.prettyListOfDrops('ps1').should.eventually.be.fulfilled);
    it('should have no drops with an odd tag', function nodrops() {
      const p = ocean.prettyListOfDrops('FOO9876');
      p.should.eventually.match('No drops');
      p.then((e, r) => console.log('drops', e, r));
    });
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
