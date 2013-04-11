/**
 * Global functions
 *
 * In this file, functions within the global RSN object are defined.
 * However, the object is further augmented in other files!
 */
/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global $, _, Github, RSN, console */
(function () {
  'use strict';

  var RSN, compiledTemplates, github, renderCompiledTemplate, storage;

  RSN = {};
  compiledTemplates = {};
  storage = {};

  // PRIVATE METHODS

  // Compiles templates and memoizes them.
  renderCompiledTemplate = function (template, data) {
    $('div[role="main"]').html(compiledTemplates[template](data));
  };

  storage.clear = function () {
    sessionStorage.clear();
    localStorage.clear();
  };

  storage.get = function (key) {
    var session, local;
    if (!_.isString(key)) {
      throw {name: 'StorageError', message: 'Key is not a string!'};
    }
    session = RSN.parse(sessionStorage.getItem(key));
    local = RSN.parse(localStorage.getItem(key));
    RSN.log(session);
    RSN.log(local);
    if (!session) {
      if (local) { storage.set(key, local); }
      return local;
    }
    if (!local) {
      if (session) { storage.set(key, session); }
      return session;
    }
    if (_.isEqual(session, local)) { return local; }
    throw {name: 'StorageError', message: 'Session or local Storage corrupt.'};
  };

  storage.remove = function (key) {
    if (!_.isString(key)) {
      throw {name: 'StorageError', message: 'Key is not a string!'};
    }
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  };

  storage.set = function (key, value) {
    if (!_.isString(key)) {
      throw {name: 'StorageError', message: 'Key is not a string!'};
    }
    sessionStorage.setItem(key, RSN.stringify(value));
    localStorage.setItem(key, RSN.stringify(value));
  };

  // PUBLIC METHODS

  /**
   * Checks if a session is either running or stored in the clients browser.
   * @return {bool} Whether the user is logged in correctly.
   */
  RSN.resumeSession = function () {
    var credentials;
    if (github) {
      return true;
    }
    credentials = storage.get('credentials');
    if (credentials) {
      github = credentials;
      return true;
    }
    return false;
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
        github = user;
        github.password = password;
        storage.set('credentials', github);
        callback(true);
      }
    });
  };

  RSN.log = function (string) {
    console.log(string);
  };

  RSN.logout = function () {
    github = undefined;
    storage.clear();
  };

  RSN.parse = function (string) {
    return JSON.parse(string);
  };

  RSN.render = function (template, data) {
    if (compiledTemplates[template]) {
      renderCompiledTemplate(template, data);
    } else {
      $.get('templates/' + template + '.ejs', function (templateContent) {
        compiledTemplates[template] = _.template(templateContent);
        renderCompiledTemplate(template, data);
      });
    }
  };

  /**
   * Convenience method to get a formated JSON string.
   * @param  {object} object A javascript object.
   * @return {string}        The stringified JSON object.
   */
  RSN.stringify = function (object) {
    return JSON.stringify(object, null, 2);
  };

  window.RSN = RSN;
}());