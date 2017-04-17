// Logging functions
import chalk from 'chalk';

function callingName() {
  // hack to get name and line calling debugging routine
  const stack = Error().stack.split('\n');
  const line = stack[2];
  const name = line.match(/[^/]*$/).toString().slice(0, -1);
  return name;
}

export default function d(...params) {
  console.log(callingName(), '|', chalk.cyan(...params));
}

/* TODO in the far future:
   Add really good promise() wrapping for debugging.
   Make sure debugging is off if (process.env.NODE_ENV !== 'production')
   Add a timestamp to debugging.
   See if I can differentiate the current thread.
   Make it prettier. */
