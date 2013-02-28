var express = require('express');
var app = express();

// Set up express
require('./settings/express.js')(express, app, __dirname);

// Global Template variables
require('./settings/locals.js')(app);

// Routes.
app.get(['/', '/home'], require('./routes/home.js'));
app.get('/cases', require('./routes/cases.js'));
app.get('/users', require('./routes/users.js'));
app.get('/login', require('./routes/login.js'));


// Go!
app.listen(8080);
console.log('Listening on http://localhost:8080/, press CTRL + C to exit.');