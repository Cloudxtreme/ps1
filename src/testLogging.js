import { d } from './logging';

d('Starting test');
describe('Logging  the trace function', () => {
  it('should be called without error', () => d('I can be called'));
  it('should handle multiple parameters', () => d('The ', 1, 2, [3], ' steps.'));
  it('should make output');  // Looks like this test would need to add mocha-sinon,
  // e.g., http://stackoverflow.com/questions/30625404/how-to-unit-test-console-output-with-mocha-on-nodejs
  // TODO:  Add mocha-sinon just to test the logger
  it('should turn off in production');  // launch a new process?  Override process.env?
});
