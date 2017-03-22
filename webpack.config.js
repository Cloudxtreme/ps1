/* eslint-disable */
var path = require('path');
var webpack = require('webpack');
var slash = path.join;

module.exports = {
  entry: slash(__dirname, 'src', 'client.js'),

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
