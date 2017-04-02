const o = console.log;

o('.1.');
o('.2.');
setTimeout((() => { o('First timeout finished'); }), 1000);
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
  throw 'aa';
  return wait(1000, 'promiseC');
});
console.log('.6.');
// const d = promiseC.then((value) => {
//  o(`in promiseC.then with value ${value}`);
// });
const e = promiseC.catch((errorMessage) => {
  o(`in promiseC.catch with err ${errorMessage}`);
});
console.log(`Notice and ${e}`);
console.log('.7.');
