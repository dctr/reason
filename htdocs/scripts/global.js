/**
 * Global functions exported via RSN object
 *
 * In this file, functions within the global RSN object are defined. It contains
 * functions to access the browser's storage and some convenience functions.
 */
/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global $, _, TPL, USR, console */
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
      if (local) { set(key, local); }
      return local;
    }
    if (!local) {
      if (session) { set(key, session); }
      return session;
    }
    if (_.isEqual(session, local)) { return local; }
    throw {name: 'StorageError', message: 'Session or local Storage corrupt.'};
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

  window.RSN = RSN;
}());