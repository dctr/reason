/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global $, _, TPL, USR, Github, console */

/**
 * Functionality exported via the global RSN object
 *
 * In this file, functions within the global RSN object are defined. It contains
 * functions to manage login to GitHub and access to local-/sessionstorage
 * Additionaly it provides some convenience functions.
 */
(function () {
  'use strict';

  var RSN, clear, get, logedIn, parse, remove, set, stringify;

  RSN = {};
  logedIn = false;


  /**
   * Clear local-/sessionstorage
   */
  RSN.clear = function () {
    sessionStorage.clear();
    localStorage.clear();
  };

  /**
   * Get local-/session stored value to key
   *
   * This method tries to read the value to key from local- and from sessionstorage.
   * @param  {string} key A key for the local-/sessionstorage
   * @return {string}     The value to the key if present.
   * @throws {StorageError} If key is not a string.
   * @throws {StorageError} If local- and session storage contain different values for key.
   */
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
    if (_.isEqual(session, local)) {
      return local;
    }
    throw {name: 'StorageError', message: 'Session or local Storage corrupt.'};
  };

  /**
   * Returns the login status
   * @return {boolean} Whether a user is loged in or not.
   */
  RSN.isLogedIn = function () {
    return logedIn;
  };

  /**
   * Logs a user is with the given credentians
   *
   * If the login succeeds, the given credentials are stored in the browsers
   * storage, such that @see RSN.resumeSession can relogin the user.
   * @param  {string}   username Username
   * @param  {string}   password Password
   * @param  {Function} callback callback(boolen) for success status.
   */
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
        // TODO: Storing password on client plaintext. Very, very naughty!
        RSN.set('credentials', {username: username, password: password});
        window.GHB = github;
        logedIn = true;
        callback(true);
      }
    });
  };

  /**
   * Logs a user out, if loged in
   */
  RSN.logout = function () {
    window.GHB = new Github();
    RSN.remove('credentials');
    logedIn = false;
  };

  /**
   * Wrapper to JSON.parse
   *
   * This method is exactly the same as JSON.parse. It just exists, so a
   * counterpart to stringify exists.
   * @param  {string} string The string to parse
   * @return {object}        A JavaScript object, if JSON.parse succeeds.
   */
  RSN.parse = function (string) {
    return JSON.parse(string);
  };

  /**
   * Removes a value from local- and sessionstorage if it exists
   * @param  {string} key The key for the element to delete
   */
  RSN.remove = function (key) {
    if (!_.isString(key)) {
      throw {name: 'StorageError', message: 'Key is not a string!'};
    }
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  };

  /**
   * Resumes a session if possible
   *
   * If credentials are stored in the browsers storage, they are used with
   * @see RSN.login to relogin the user.
   * @param  {Function} callback callback(boolean) for success status.
   */
  RSN.resumeSession = function (callback) {
    var credentials = RSN.get('credentials');
    if (credentials && credentials.username && credentials.password) {
      RSN.login(credentials.username, credentials.password, callback);
    } else {
      callback(false);
    }
  };

  /**
   * Sets a key/value-pair in both local- and sessionstorage
   * @param  {string} key   Key
   * @param  {string} value Value
   * @throws {StorageError} If key is not a string.
   */
  RSN.set = function (key, value) {
    if (!_.isString(key)) {
      throw {name: 'StorageError', message: 'Key is not a string!'};
    }
    sessionStorage.setItem(key, RSN.stringify(value));
    localStorage.setItem(key, RSN.stringify(value));
  };

  /**
   * Convenience method to get a nicely formated JSON string.
   *
   * @see JSON.stringify(object) creates a one-liner. For debug purposes i often
   * wanted nicely formated multiline JSON but was to lazy to type...
   * @param  {object} object A javascript object.
   * @return {string}        The stringified JSON object.
   */
  RSN.stringify = function (object) {
    return JSON.stringify(object, null, 2);
  };

  /**
   * GHB is the global Github object
   *
   * The object is reasigned in login/logout/resumeSession, this just provides
   * an "empty" (anonymous) GHB per default.
   * @type {Github}
   */
  window.GHB = new Github();

  /**
   * Export the global RSN object
   * @type {RSN}
   */
  window.RSN = RSN;
}());