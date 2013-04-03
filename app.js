/**
 * REaSoN node.js app
 *
 * @author David Christ <david.christ@uni-trier.de
 */

/*global GLOBAL */
/*jslint indent: 2, node: true, nomen: true */
'use strict';

var async, fs, https, express, app, requireLogin;

async = require('async');
fs = require('fs');
https = require('https');
express = require('express');

app = express();

// Functions
requireLogin = function (req, res, next) {
  if (req.session.auth) {
    next();
  } else {
    res.send(404);
  }
};

// Setting up the environment
require('./settings/express.js')(express, app, __dirname);

// Make the global RSN object available
GLOBAL.RSN = require('./settings/global.js')(__dirname);

// Define routes
app.all(['/', '/home'], require('./routes/home.js'));
app.all('/cases', require('./routes/cases.js'));
app.all('/cases/:caseid([0-9]+)', require('./routes/casesCaseid.js'));
app.all(
  '/cases/:caseid([0-9]+)/:branchid([a-z\\-\\_]+)',
  require('./routes/casesCaseidBranchid.js')
);
app.all('/cases/create', requireLogin, require('./routes/casesCreate.js'));
app.all('/users', require('./routes/users.js'));
app.all('/users/:userid([a-z]+)', require('./routes/usersUserid.js'));
app.all('/login', require('./routes/login.js'));
app.all('/logout', function (req, res) {
  req.session.destroy();
  res.redirect(303, '/');
});

// Load key and cert in parallel and start server when both files are loaded.
async.parallel(
  [
    function (callback) {
      fs.readFile('./settings/server.key.insecure', function (err, key) {
        callback(err, key);
      });
    },
    function (callback) {
      fs.readFile('./public/server.crt', function (err, cert) {
        callback(err, cert);
      });
    }
  ],
  function (err, results) {
    var sslOptions = {
      key: results[0],
      cert: results[1]
    };
    https.createServer(sslOptions, app).listen(app.get('port'), function () {
      console.log('Express server listening on port ' + app.get('port'));
    });
  }
);