var http = require('http');
var express = require('express');
var app = express();

// Setting up the environment
require('./settings/express.js')(express, app, __dirname);
require('./settings/template.js')(app);
RSN = (function () {
  return {
    datadir: __dirname + '/app_data',
    exceptionToString: function (e) {
      var str;
      for (var prop in e) {
        str += prop + ': ' + e.prop + '\n';
      }
      return str;
    }
  }
}());

// Defining routes
app.get(['/', '/home'], require('./routes/home.js'));
app.get('/cases', require('./routes/cases.js'));
app.get('/users', require('./routes/users.js'));
app.get('/login', require('./routes/login.js'));

// Start the server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
