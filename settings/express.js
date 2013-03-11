module.exports = function (express, app, rootdir) {

  // Express settings.
  app.set('env', 'development');
  app.set('port', process.env.PORT || 8080);
  app.set('views', rootdir + '/views');
  app.set('view engine', 'ejs');

  // Provided middleware.
  app.use(express.favicon()); // Path can be given as parameter
  if (app.get('env') === 'development') {
    app.use(express.logger('dev'));
  } else {
    app.use(express.logger());
  }
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('aabece9605acd3c4243a9a2de29cea028bad6a720386b2d9f567a98065967ea39d11951529c14e959a6896fcd7025f1d7e69b6a320c7b3fc133a39d6e1f3973d'));
  app.use(express.session({
    key: 'sid',
    secret: 'aabece9605acd3c4243a9a2de29cea028bad6a720386b2d9f567a98065967ea39d11951529c14e959a6896fcd7025f1d7e69b6a320c7b3fc133a39d6e1f3973d'
  }));
  app.use(express.csrf());

  // Own middleware, needs the session, has to be processed before the
  // rendering of the page (done in router).
  app.use(require(rootdir + '/controllers/userManager.js'));

  app.use(app.router);
  app.use(express.static(rootdir + '/public'));

  // The errorHandler doesn't next()!
  if (app.get('env') === 'development') {
    app.use(express.errorHandler());
  }
}