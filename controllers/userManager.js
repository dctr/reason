module.exports = function (req, res, next) {
  var crypto = require('crypto');
  var fs = require('fs');
  var sha256 = crypto.createHash('sha256');

  var reqUser, filePasswd;

  // Check cookie for login information or POST for login info
  if (typeof req.session.auth === 'undefined') {
    // Check for login post
    if (req.body.login) {
      try {
        reqUser = req.body.email.split('@', 2);
        if (! /\w/.test(reqUser[0]) || reqUser[1] !== RSN.domain) {
          throw {name: 'CredentialErrror', message: 'Invalid reqUser.'};
        }
        // Throws an exception if either folder or file do not exist.
        filePasswd = JSON.parse(
            fs.readFileSync(RSN.usersdir + '/user/password.ssha256.txt'));

        saltedPasswd = req.body.password + filePasswd.salt + RSN.pepper;
        reqPasswdHash = sha256.update().digest('base64');


        // Read salt off fileCred, hash body-pw with salt and papper and compare to fileCred hash
      } catch (e) {
        // Add message: User does not exist.
      }
      // Check is userdir exists
      // Check password against profiles password
      req.session.auth = req.body.email;
    }
  }

  // Make some session vars available to the template.
  res.locals.csrf = req.session._csrf;
  res.locals.auth = req.session.auth || false;

  next();
}