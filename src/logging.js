// Logging functions, notably t() for tracing.
import chalk from 'chalk';

// export t = con.info;
export default function d(...params) {
  console.log(chalk.cyan(...params));
}

/* TODO in the far future:
   Add really good promise() wrapping for debugging.
   Make sure debugging is off if (process.env.NODE_ENV !== 'production')
   Add a timestamp to debugging.
   See if I can differentiate the current thread.
   Make it prettier. */
