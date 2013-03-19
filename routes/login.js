module.exports = function (req, res, next) {

  console.log('login.js');

  var userManager = require(RSN.appdir + 'controllers/userManager.js')(
    RSN.usersdir, 'credentials.json', 100000, RSN.pepper
  );

  var checkUsername = function () {
    if (! /\w/.test(req.body.username)) {
      throw {name: 'CredentialErrror', message: 'Invalid username.'};
    }
  }

  // Test POST data only if not authenticated already.
  if (typeof req.session.auth === 'undefined') {
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
        if (userManager.register(req.body.username, req.body.password1)) {
          // Add message: regsiter success
          console.log('Register success.');
        } else {
          throw {
            name: 'CredentialErrror',
            message: 'Could not register the username.'
          };
        }
      }
    } catch (e) {
      // Add message e
      console.log(e);
    }
    res.render('login');
  } else {
    // render 404 as login invalid if loged in
    next();
  }
};