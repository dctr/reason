/**
 * Assignments valid for all templates.
 */

/*jslint indent: 2 */ // Set indent to 2 spaces
/*jslint nomen: true */ // Allow underscores, as in _csrf
'use strict';

module.exports = function (req, res, next) {
  // Make some session vars available to the template.
  res.locals.csrf = req.session._csrf;

  res.locals.pages = {
    home: 'Home',
    cases: 'Fälle',
    users: 'Nutzer'
  };

  if (req.session.auth) {
    res.locals.auth = req.session.auth;
    res.locals.pages['users/' + req.session.auth] = req.session.auth;
  } else {
    res.locals.pages.login = 'Login';
  }

  next();
};