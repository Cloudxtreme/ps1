// Logging functions
import chalk from 'chalk';


function nodeReportUnhandledPromises() {
  process.on('unhandledRejection', (err, promise) => {
    console.error(`Unhandled rejection:\n   promise: ${promise}\n   reason: ${err.message}`);
    console.error(err.stack);
  });
}
nodeReportUnhandledPromises();   // always run this if real logging enabled.

function callingName() {
  // hack to get name and line calling debugging routine
  const stack = Error().stack.split('\n');
  const line = stack[3];
  const name = line.match(/[^/]*$/).toString().slice(0, -1);
  return name;
}

export function d(...params) {
  const caller = callingName();
  console.log(caller, '|', chalk.cyan(...params));
}

export function ddir(title, ...params) {
  const caller = callingName();
  console.log(caller, '|', '----------------------');
  console.log('Record ', title);
  console.dir(...params);
  console.log(caller, '|', '----------------------');
}


/* TODO in the far future:
   Add really good promise() wrapping for debugging.
   Make sure debugging is off if (process.env.NODE_ENV !== 'production')
   Add a timestamp to debugging.
   See if I can differentiate the current thread.
   Make it prettier. */
