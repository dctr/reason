module.exports = function (express, app, rootdir) {

  // Express settings.
  app.set('env', 'development');
  app.set('views', rootdir + '/views');
  app.set('view engine', 'ejs');


  // Middleware.

  // Log requests via console.
  app.use(express.logger());

  // Defining static(/public) before logger will omit logs for /public
  app.use('/public', express.static(rootdir + '/public'));


  // Error handling middleware, will be execuded last if someone next()-s.
  app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.send(500, 'Something broke!');
    // If further error handlers are given, uncomment the next().
    //next(err);
  });
}