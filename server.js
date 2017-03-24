/* eslint-disable */  // no transpiling for this node program.
// server.js
var express = require('express')
var compression = require('compression')
var path = require('path')
var slash = path.join;

var app = express();
app.use(compression());

app.use(express.static(slash(__dirname, 'public')));

// express sends all requests to index.html,
// this page has the div 'app' overwritten with each page.
// This allows browserHistory in React Router to work
app.get('*', function (req, res) {
  res.sendFile(slash(__dirname, 'public', 'index.html'))
})

var PORT = process.env.PORT || 8080
app.listen(PORT, function() {
  console.log('Production Express server running at localhost:' + PORT)
})
