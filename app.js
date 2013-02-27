var express = require('express');
var app = express();

app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use('/public', express.static(__dirname + '/public'));
});

app.get('/', function (req, res) {
  res.render('index', {foo: "bar", layout: false});
});

app.listen(8080);