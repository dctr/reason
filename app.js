var fs = require('fs');
var https = require('https');
var express = require('express');
var app = express();

// Setting up the environment
require('./settings/express.js')(express, app, __dirname);
require('./settings/template.js')(app);
RSN = (function () {
  return {
    datadir: __dirname + '/app_data',
  }
}());

// Defining routes
// TODO add '*' route to handle login
app.get(['/', '/home'], require('./routes/home.js'));
app.get('/cases', require('./routes/cases.js'));
app.get('/cases/:caseid(\\d+)', require('./routes/cases-caseid.js'));
app.get('/users', require('./routes/users.js'));
app.get('/users/:userid(\\w+)', require('./routes/users-userid.js'));
app.get('/login', require('./routes/login.js'));
// app.get('/TPL', require('./routes/TPL.js'));
// TODO add '*' route for 404s

// Start the server
var sslOptions = {
    key: fs.readFileSync('./settings/server.key.insecure'),
    cert: fs.readFileSync('./public/server.crt')
};
https.createServer(sslOptions, app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
