/**
 * REaSoN node.js app
 *
 * @author David Christ <david.christ@uni-trier.de
 */

/*global GLOBAL */
/*jslint indent: 2 */ // Set indent to 2 spaces
/*jslint node: true */
/*jslint nomen: true */ // Allow underscores, as in __dirname
'use strict';

var fs = require('fs');
var https = require('https');
var express = require('express');

var app = express();

// Setting up the environment
require('./settings/express.js')(express, app, __dirname);

// Make the global RSN object available
GLOBAL.RSN = require('./controllers/global.js')(__dirname);

// Define routes
app.all(['/', '/home'], require('./routes/home.js'));
app.all('/cases', require('./routes/cases.js'));
app.all('/cases/:caseid(\\d+)', require('./routes/cases-caseid.js'));
app.all('/users', require('./routes/users.js'));
app.all('/users/:userid(\\w+)', require('./routes/users-userid.js'));
app.all('/login', require('./routes/login.js'));

var sslOptions = {};
fs.readFile('./settings/server.key.insecure', function (err, key) {
  sslOptions.key = key;
  fs.readFile('./public/server.crt', function (err, cert) {
    sslOptions.cert = cert;
    https.createServer(sslOptions, app).listen(app.get('port'), function () {
      console.log('Express server listening on port ' + app.get('port'));
    });
  });
});