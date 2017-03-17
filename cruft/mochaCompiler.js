// This file is used a 'compiler' transform step by Mocha.
// It converts tests to es6 and can stub components.
// See http://www.hammerlab.org/2015/02/14/testing-react-web-apps-with-mocha/
// Copied from https://raw.githubusercontent.com/danvk/mocha-react/jsx-stubs/tests/compiler.js
/* eslint-disable */  // because this is not es6

// Based on https://github.com/Khan/react-components/blob/master/test/compiler.js
let fs = require('fs'),    // node fs tools
  ReactTools = require('react-tools'),  // note react-tools is deprecated, https://facebook.github.io/react/blog/2015/06/12/deprecating-jstransform-and-react-tools.html
  origJs = require.extensions['.js'];

// A module that exports a single, stubbed-out React Component.
const reactStub = 'module.exports = require("react").createClass({render:function(){return null;}});';

// Should this file be stubbed out for testing?
function shouldStub(filename) {
  if (!global.reactModulesToStub) return false;

  // Check if the file name ends with any stub path.
  const stubs = global.reactModulesToStub;
  for (let i = 0; i < stubs.length; i++) {
    if (filename.substr(-stubs[i].length) == stubs[i]) {
      return true;
    }
  }
  return false;
}

// Transform a file via JSX/Harmony or stubbing.
function transform(filename) {
  if (shouldStub(filename)) {
    return reactStub;
  }
  const content = fs.readFileSync(filename, 'utf8');
  return ReactTools.transform(content, { harmony: true });
}

// Install the compiler.
require.extensions['.js'] = function (module, filename) {
  // optimization: code in a distribution should never go through JSX compiler.
  if (filename.indexOf('node_modules/') >= 0) {
    return (origJs || require.extensions['.js'])(module, filename);
  }

  return module._compile(transform(filename), filename);
};
