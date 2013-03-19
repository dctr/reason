var fs = require('fs');
var https = require('https');
var express = require('express');
var app = express();

// Setting up the environment
require('./settings/express.js')(express, app, __dirname);
RSN = (function () {
  return {
    domain: 'example.com',
    appdir:   __dirname + '/',
    datadir:  __dirname + '/app_data/',
    usersdir: __dirname + '/app_data/users/',
    casesdir: __dirname + '/app_data/cases/',
    pepper: 'SvtB6XiodbPrU04+n0vcy/rsigsp3LxXf7itk97hcf0='
  }
}());

// Defining routes
app.all(['/', '/home'], require('./routes/home.js'));
app.all('/cases', require('./routes/cases.js'));
app.all('/cases/:caseid(\\d+)', require('./routes/cases-caseid.js'));
app.all('/users', require('./routes/users.js'));
app.all('/users/:userid(\\w+)', require('./routes/users-userid.js'));
app.all('/login', require('./routes/login.js'));

// Start the server
var sslOptions = {
    key: fs.readFileSync('./settings/server.key.insecure'),
    cert: fs.readFileSync('./public/server.crt')
};
https.createServer(sslOptions, app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
