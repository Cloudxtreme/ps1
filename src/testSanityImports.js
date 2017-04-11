/* Really basic JavaScript tests, to see if mocha is running */
import React from 'react';
import 'should';
import _ from 'lodash';
import { line } from './junkDrawer';


describe('Basic Sanity Test of import statements', () => {
  describe('different import statements', () => {
    it("should `import React from 'React';`", () => React);
    it("should `import 'should';`", () => true);
  });
  describe('and can pull items from my modules', () => {
    it('should have line', () => !(_.isUndefined(line)));
  });
});
