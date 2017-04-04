const o = console.log;

o('.1.');
o('.2.');
setTimeout(   // a function with two parameters
    () => {   // first parameter is an arrow function
      o('First timeout finished');
    }  // end of the arrow function
  , 1000,    // second parameter, 1000 seconds
);   // end of set timeout.
setTimeout(() => { o('First timeout finished'); }, 1000);
o('.3.');

function wait(milliseconds, value = undefined) {
  // promise to return value (or to fail if value is 'fail') after
  // given number of milliseconds
  return new Promise((resolve, reject) => {
    o(`Wait begins: ${milliseconds} before ${value}`);
    setTimeout(() => {
      o(`Wait ends: ${milliseconds} for ${value}`);
      if (value !== 'fail') {
        resolve(value);
      } else {
        reject(value);
      }
    }, milliseconds);
  });
}

const promiseA = wait(2000, 'promiseA');
console.log('.4.');
const promiseB = promiseA.then(value => o(`value is ${value}`));
console.log('.5.');
const promiseC = promiseA.then((value) => {
  o(`in promiseA.then with value ${value}`);
  o('which means promiseA must have resolved');
  return wait(1000, 'promiseC');
});
console.log('.6.');
const promiseD = promiseC.then((value) => {
  o(`in promiseC.then with value ${value}`);
});
const promiseE = promiseC.catch((errorMessage) => {
  o(`in promiseC.catch with err ${errorMessage}`);
});
console.log(`  promiseD is a ${promiseD}, because then() is always a promise.`);
console.log(`  promiseE is a ${promiseE}, because catch() is always a promise.`);
console.log('.7.');
