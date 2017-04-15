// simple test of async-await

function resolveAfter2Seconds(x) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(x);
    }, 2000);
  });
}

async function f1() {
  const x = await resolveAfter2Seconds(10);
  console.log(x); // 10
}
f1();

async function foo() {
  console.log('in foo');
  setTimeout(() => 5, 50);
  const p = new Promise(resolve => setTimeout(() => resolve(3), 1000));
  const ret = await p;
  console.log(ret);
  console.log('leaving foo');
}

function f2() {
  console.log('calling foo');
  try {
    foo();
  } catch (err) {
    console.log('caught err', err);
  }
  console.log('called foo');
}
f2();
