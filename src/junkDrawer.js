/* junkDrawer - a place for my stuff.

Everywhere, there is a module of 'assorted general utilities'.  It's the
junk drawer of architecture.   We believe that with effort, we can clean
the junk drawer, but is it worth it?

*/
import _ from 'lodash';
import d from './logging';


export function nodeReportUnhandledPromises() {
  process.on('unhandledRejection', (err, promise) => {
    console.error('Unhandled rejection (promise: ', promise, ', reason: ', err, ').');
  });
}

export function line(theChar) {
  return `${Array(60).join(theChar)}\n`;
}

export function wait(delayMs, value) {
  // promise fulfills with value after delay time (in milliseconds)
  return new Promise((resolve) => {
    d('wait:  setting timeout of ', delayMs);
    setTimeout(() => resolve(value), delayMs);
  });
}

export function poll(retryDelays, errorMessage, polledPromise, isDoneFn) {
  // isDoneFn returns true if done or false if more polling needed
  // polledPromise resolves to a value passed to the isDoneFn
  // Fulfills with result from polledPromise or
  // Rejects if out of polling times or polledPromise rejects.

  function recursivePoll() {
    const delay = retryDelays.shift();
    if (_.isUndefined(delay)) {
      return Error(errorMessage);
    }
    return wait(delay)
      .then(polledPromise)
      .then((result) => {
        if (isDoneFn(result)) {
          return result;
        }
        return recursivePoll();  // tail-end recursion for Promises
      });
  }
  d('In poll with retryDelays: ', retryDelays);
  return recursivePoll();
}
