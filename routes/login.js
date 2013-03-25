/**
 * Script behind the login page
 */

/*global RSN */
/*jslint indent: 2, node: true, nomen: true */
'use strict';

module.exports = function (req, res, next) {
  var checkUsername, userManager;

  userManager = require(RSN.dir.app + 'lib/userManager.js')(
    RSN.dir.users,
    'credentials.json',
    100000,
    RSN.pepper
  );

  checkUsername = function () {
    if (!/\w/.test(req.body.username)) {
      throw {name: 'CredentialErrror', message: 'Invalid username.'};
    }
  };

  // Test POST data only if not authenticated already.
  if (req.session.auth === undefined) {
    try {
      // Check POST in req.body for form data.
      if (req.body.login) {
        checkUsername();
        if (userManager.login(req.body.username, req.body.password)) {
          req.session.auth = req.body.username;
          res.redirect(303, '/');
          // BREAK
        } else {
          throw {
            name: 'CredentialErrror',
            message: 'Invalid username or password.'
          };
        }
      } else if (req.body.register) {
        checkUsername();
        if (req.body.password1 !== req.body.password2) {
          throw {name: 'CredentialErrror', message: 'Passwords do not match.'};
        }
        // TODO: add message if registration success.
        if (!userManager.register(req.body.username, req.body.password1)) {
          throw {
            name: 'CredentialErrror',
            message: 'Could not register the username.'
          };
        }
      }
    } catch (e) {
      // TODO: Add message e
      console.log(e);
    }
    res.render('login');
  } else {
    // render 404 as login invalid if loged in
    next();
  }
};