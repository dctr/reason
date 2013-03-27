/*global console */
/*jslint browser: true, indent: 2 */
(function () {
  'use strict';

  var RSN = {};

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

  RSN.parse = function (string) {
    return JSON.parse(string);
  };

  RSN.stringify = function (object) {
    return JSON.stringify(object, null, 2);
  };

  /**
   * Export RSN to either a global browser object or as node module;
   */
  /*jslint browser:true, node: true */
  if (window) {
    window.RSN = RSN;
  } else if (module) {
    module.exports = RSN;
  }
}());