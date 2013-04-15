/**
 * Defines the global USR object
 */
/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global $, _, Github, RSN, TPL, console */
(function () {
  'use strict';

  var USR;

  USR = {};

  USR.profile = undefined;

  /**
   * Checks if a session is either running or stored in the clients browser.
   * @return {bool} Whether the user is logged in correctly.
   */
  USR.resumeSession = function () {
    var credentials;
    if (USR.profile) {
      return true;
    }
    credentials = RSN.get('credentials');
    if (credentials) {
      USR.profile = credentials;
      return true;
    }
    return false;
  };

  USR.login = function (username, password, callback) {
    USR.profile = new Github({
      username: username,
      password: password,
      auth: 'basic'
    });
    USR.profile.getUser().show(username, function (err, user) {
      if (err) {
        callback(false);
      } else {
        //profile = user;
        RSN.set('credentials', USR.profile);
        callback(true);
      }
    });
  };

  USR.logout = function () {
    USR.profile = undefined;
    RSN.remove('credentials');
  };

  window.USR = USR;
}());