/* Really basic JavaScript tests, to see if mocha is running */
import React from 'react';
import 'should';

describe('Basic Sanity Test of import statements', () => {
  describe('different import statements', () => {
    it("should `import React from 'React';`", () => true);
    it("should `import 'should';`", () => true);
  });
});
