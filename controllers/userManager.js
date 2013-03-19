module.exports = function (profilesDirectory, credentialsFile, rounds, pepper) {
  var crypto = require('crypto');
  var fs = require('fs');
  if (typeof rounds !== 'number') {
    throw {
      name: 'ParameterError',
      message: 'Parameter "rounds" must be a number.'
    };
  }
  pepper = pepper || '';

  var hashPassword = function (password) {
    for (var i = 0; i < rounds; i += 1) {
      password = crypto.createHash('sha256')
                     .update(password)
                     .digest('base64');
    }
    return password;
  }

  return {
    login: function (username, password) {
      var credentials = JSON.parse(
        fs.readFileSync(profilesDirectory + username + '/' + credentialsFile)
      );
      if (credentials.username !== username) {
        throw {name: 'CredentialsError', message: 'User record corrupt.'}
      }
      return hashPassword(password + credentials.salt + pepper) ===
             credentials.hash;
    },

    register: function (username, password) {
      var credentials = profilesDirectory + username + '/' + credentialsFile;
      if (fs.existsSync(credentials)) {
        throw {
          name: 'CredentialsError',
          message: 'User already exists.'
        };
      }
      var salt = crypto.randomBytes(32).toString('base64');
      var passwordHash = hashPassword(password + salt + pepper);
      fs.mkdirSync(profilesDirectory + username);
      fs.writeFile(credentials, JSON.stringify({
        username: username,
        salt: salt,
        hash: passwordHash
      }));
      return true;
    }
  }
};