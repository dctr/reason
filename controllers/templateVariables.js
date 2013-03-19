module.exports = function (req, res, next) {
  // Make some session vars available to the template.
  res.locals.csrf = req.session._csrf;

  res.locals.pages = {
    home: 'Home',
    cases: 'Fälle',
    users: 'Nutzer'
  }

  if (req.session.auth) {
    res.locals.auth = req.session.auth;
    res.locals.pages.profile = req.session.auth;
  } else {
    res.locals.pages.login = 'Login';
  }


  next();
}