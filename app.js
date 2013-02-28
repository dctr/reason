var express = require('express');
var app = express();


// Express settings.
app.set('env', 'development');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


// Middleware.

// Log requests via console.
app.use(express.logger());

// Defining static(/public) before logger will omit logs for /public
app.use('/public', express.static(__dirname + '/public'));


// Error handling middleware, will be execuded last if someone next()-s.
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.send(500, 'Something broke!');
  // If further error handlers are given, uncomment the next().
  //next(err);
});


// Global Template variables
app.locals.pages = {
  home: 'Home',
  cases: 'Cases',
  users: 'Users',
  login: 'Login'
};

console.log(app.locals);

// Routes.
app.get(['/', '/home'], function (req, res) {
  res.render('home', {message: 'This is the start page'});
});

app.get('/cases', function (req, res) {
  res.render('cases', {message: 'This is the cases page'});
});

app.get('/users', function (req, res) {

});


// Go!
app.listen(8080);
console.log('Listening on http://localhost:8080/, press CTRL + C to exit.');