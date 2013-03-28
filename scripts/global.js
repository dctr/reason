/**
 * Global functions
 *
 * In this file, functions within the global RSN object are defined.
 * However, the object is further augmented in other files!
 */
/*jslint browser: true, indent: 2, nomen: true */
/*global $, _, console */
(function () {
  'use strict';

  var RSN, compileTemplate;

  RSN = {};

  // Compiles templates and memoizes them.
  compileTemplate = _.memoize(function (template) {
    var tpl = $('script.' + template).html();
    console.log(tpl);
    return _.template(tpl);
  });

  // BEGIN DEBUG METHODS
  RSN.populateStorage = function () {
    sessionStorage.foo = "bar";
    localStorage.ba = "ka";
  };

  RSN.printStorage = function () {
    console.log('SESSION STORAGE');
    console.log(RSN.stringify(sessionStorage));
    console.log('');
    console.log('LOCAL STORAGE');
    console.log(RSN.stringify(localStorage));
  };
  // END DEBUG METHODS

  RSN.parse = function (string) {
    return JSON.parse(string);
  };

  RSN.render = function (template, data) {
    console.log(template + ' -> ' + RSN.stringify(data));
    var fun = compileTemplate(template);
    $('div[role="main"]').html(fun(data));
  };

  /**
   * Convenience method to get a formated JSON string.
   * @param  {object} object A javascript object.
   * @return {string}        The stringified JSON object.
   */
  RSN.stringify = function (object) {
    return JSON.stringify(object, null, 2);
  };

  // Export RSN to either a window browser object or as node module;
  /*jslint browser:true, node: true */
  if (window) {
    window.RSN = RSN;
  } else if (module) {
    module.exports = RSN;
  }
}());