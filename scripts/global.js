/**
 * Global functions exported via RSN object
 *
 * In this file, functions within the global RSN object are defined. It contains
 * functions to access the browser's storage and some convenience functions.
 */
/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global $, _, TPL, USR, Github, console */
(function () {
  'use strict';

  var RSN, clear, get, parse, remove, set, stringify;

  RSN = {};

  RSN.clear = function () {
    sessionStorage.clear();
    localStorage.clear();
  };

  RSN.get = function (key) {
    var session, local;
    if (!_.isString(key)) {
      throw {name: 'StorageError', message: 'Key is not a string!'};
    }
    session = RSN.parse(sessionStorage.getItem(key));
    local = RSN.parse(localStorage.getItem(key));
    if (!session) {
      if (local) { RSN.set(key, local); }
      return local;
    }
    if (!local) {
      if (session) { RSN.set(key, session); }
      return session;
    }
    if (_.isEqual(session, local)) { return local; }
    throw {name: 'StorageError', message: 'Session or local Storage corrupt.'};
  };

  RSN.login = function (username, password, callback) {
    var github = new Github({
      username: username,
      password: password,
      auth: 'basic'
    });
    github.getUser().show(username, function (err, user) {
      if (err) {
        callback(false);
      } else {
        RSN.set('credentials', {username: username, password: password});
        window.GHB = github;
        callback(true);
      }
    });
  };

  RSN.logout = function () {
    window.GHB = new Github();
    RSN.remove('credentials');
  };

  RSN.parse = function (string) {
    return JSON.parse(string);
  };

  RSN.remove = function (key) {
    if (!_.isString(key)) {
      throw {name: 'StorageError', message: 'Key is not a string!'};
    }
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  };

  /**
   * Checks if a session is either running or stored in the clients browser.
   * @return {bool} Whether the user is logged in correctly.
   */
  RSN.resumeSession = function (callback) {
    var credentials = RSN.get('credentials');
    if (credentials && credentials.username && credentials.password) {
      RSN.login(credentials.username, credentials.password, callback);
    } else {
      callback(false);
    }
  };

  RSN.set = function (key, value) {
    if (!_.isString(key)) {
      throw {name: 'StorageError', message: 'Key is not a string!'};
    }
    sessionStorage.setItem(key, RSN.stringify(value));
    localStorage.setItem(key, RSN.stringify(value));
  };

  /**
   * Convenience method to get a formated JSON string.
   * @param  {object} object A javascript object.
   * @return {string}        The stringified JSON object.
   */
  RSN.stringify = function (object) {
    return JSON.stringify(object, null, 2);
  };

  window.GHB = new Github();
  window.RSN = RSN;
}());