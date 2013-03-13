var fs = require('fs');
var https = require('https');
var express = require('express');
var app = express();

// Setting up the environment
require('./settings/express.js')(express, app, __dirname);
require('./settings/template.js')(app);
RSN = (function () {
  return {
    domain: 'example.com',
    datadir: __dirname + '/app_data/',
    usersdir: datadir + '/users/',
    casesdir: datadir + '/cases/',
    pepper: 'f6985cd5b4'
  }
}());

// Defining routes
// TODO add '*' route to handle login
app.all(['/', '/home'], require('./routes/home.js'));
app.all('/cases', require('./routes/cases.js'));
app.all('/cases/:caseid(\\d+)', require('./routes/cases-caseid.js'));
app.all('/users', require('./routes/users.js'));
app.all('/users/:userid(\\w+)', require('./routes/users-userid.js'));
app.all('/login', require('./routes/login.js'));
// app.all('/TPL', require('./routes/TPL.js'));
// TODO add '*' route for 404s

// Start the server
var sslOptions = {
    key: fs.readFileSync('./settings/server.key.insecure'),
    cert: fs.readFileSync('./public/server.crt')
};
https.createServer(sslOptions, app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
