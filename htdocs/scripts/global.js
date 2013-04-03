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

  var RSN, renderCompiledTemplate, compiledTemplates;

  RSN = {};
  compiledTemplates = {};

  // PRIVATE METHODS

  // Compiles templates and memoizes them.
  renderCompiledTemplate = function (template, data) {
    $('div[role="main"]').html(compiledTemplates[template](data));
  };

  // PUBLIC VARS

  RSN.github = undefined;

  // PUBLIC METHODS

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
        RSN.github = github;
        RSN.github.password = password;
        RSN.store('credentials', RSN.github);
        callback(true);
      }
    });
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

  RSN.retrieve = function (key) {
    var session, local;
    if (!_.isString(key)) {
      throw {name: 'StorageError', message: 'Key is not a string!'};
    }
    session = sessionStorage.getItem(key);
    local = localStorage.getItem(key);
    if (_.isUndefined(session)) { return local; }
    if (_.isUndefined(local)) { return session; }
    if (_.isEqual(session, local)) { return local; }
    throw {name: 'StorageError', message: 'Session or local Storage corrupt.'};
  };

  RSN.store = function (key, value) {
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

  window.RSN = RSN;
}());