/* eslint-disable */
var path = require('path');
var webpack = require('webpack');
var slash = path.join;

module.exports = {
  entry: ['babel-polyfill', slash(__dirname, 'src', 'client.js')],
     // add babel-polyfill per http://stackoverflow.com/a/41062991/1320510

  output: {
    path: slash(__dirname, '/public'),
    filename: 'bundle.js',
    publicPath: '/',
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader?presets[]=es2015&presets[]=react' },
    ],
  },

  plugins: process.env.NODE_ENV === 'production' ? [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin(),
  ] : [],
};
