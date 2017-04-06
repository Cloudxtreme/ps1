// Logging functions, notably t() for tracing.
import console from 'better-console';

// export t = con.info;
export default function d(...params) {
  console.info(...params);
}

//
// //const testing = (process.env.NODE_ENV !== 'production');
// export const t = testing ? trace : (() => {});  // only output in production
//
// const trace = console.trace;
//
// // TODO how to do env
// const timeOfFirstCall = 0; // TODO:  find time of now.
//   // TODO:  JavaScript global singleton.
//  // nice interface, export 'logger' and helper functions c, t, etc.?
//
//    // time mark in green.   Message, indent?
//    // TODO:  JavaScript have a with statement to do the indents?
//    // TODO:  What does JavaScript use tildes for?
