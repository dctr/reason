/**
 * Functions for user management.
 *
 * Takes as arguments where the profiles are stored, how the profiles file is
 * named, how many rounds the hash should be run and the server-wide pepper.
 *
 * Exports an object with two functions:
 * login(username, password) checks credentials
 * register(username, password) creates credentials
 */

/*global RSN */
/*jslint indent: 2 */ // Set indent to 2 spaces
'use strict';

module.exports = function (profilesDirectory, credentialsFile, rounds, pepper) {
  var crypto = require('crypto');
  var fs = require('fs');
  var strftime = require('strftime');

  var hashPassword = function (password) {
    var i;
    for (i = 0; i < rounds; i += 1) {
      password = crypto.createHash('sha256')
                       .update(password)
                       .digest('base64');
    }
    return password;
  };

  var afterRegistration = function (username) {
    // async, no error callback
    fs.writeFile(profilesDirectory + username + '/profile.json',
      RSN.stringify(RSN.blankProfile()));
  };

  if (typeof rounds !== 'number') {
    throw {
      name: 'ParameterError',
      message: 'Parameter "rounds" must be a number.'
    };
  }

  pepper = pepper || '';

  return {
    login: function (username, password) {
      var credentials = JSON.parse(
        fs.readFileSync(profilesDirectory + username + '/' + credentialsFile)
      );
      if (credentials.username !== username) {
        throw {name: 'CredentialsError', message: 'User record corrupt.'};
      }
      return hashPassword(password + credentials.salt + pepper) ===
             credentials.hash;
    },

    register: function (username, password) {
      var
        credentials = profilesDirectory + username + '/' + credentialsFile,
        salt = crypto.randomBytes(32).toString('base64'),
        passwordHash = hashPassword(password + salt + pepper);
      if (fs.existsSync(credentials)) {
        throw {
          name: 'CredentialsError',
          message: 'User already exists.'
        };
      }
      fs.mkdirSync(profilesDirectory + username);
      // async
      fs.writeFile(credentials, RSN.stringify({
        username: username,
        salt: salt,
        hash: passwordHash
      }));
      afterRegistration(username);
      return true;
    }
  };
};