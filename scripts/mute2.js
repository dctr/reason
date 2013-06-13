/*jslint browser: true, es5: true, indent: 2, node: true, nomen: true, todo: true */
/*global _, define, console */

/**
 * Module boilerplate.
 *
 * This boilerplate samples a module that provides a constructor function with
 * private variables through closure which is invoked without a new keyword.
 * In addition, it contains JSLint asignments following the author's
 * coding conventions.
 *
 * Please replace MODULENAME in the last line.
 *
 * @author David Christ <david.christ@uni-trier.de>
 * @version 0.1
 */
(function (modulename) {
  'use strict';

  var constructor;


  // -----
  // Private Static
  // ----------

  constructor = function (spec, superConstructor) {
    var that, ejsDir, jsDir, nop, request, resolve;

    // -----
    // Validate input
    // ----------

    ejsDir = spec.ejsDir || '/templates';
    jsDir = spec.jsDir || '/templates';


    // -----
    // Private non-static
    // ----------

    nop = function () {};

    request = function (url, cb, cbArgs) {
      var xhr;
      // NOTE: A 304 from the server results in a client-side 200.
      xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onload = function (e) {
        if (this.status !== 200) {
          cb(new Error('Failed to retrieve ' + url + '.'), undefined, cbArgs);
        } else {
          cb(undefined, this.response, cbArgs);
        }
      };
      xhr.send();
    };

    resolve = function (str, data) {
      // match "<% include tplName %>"
      return _.template(
        str.replace(
          /<%\s*include\s*(.*?)\s*%>/g,
          function (match, tplName) {
            // TODO: return resolve(url/tplName);
          }
        ),
        data
      );
    }


    // -----
    // Public non-static
    // ----------

    that = {};

    that.render = function (tplName, tplArgs, cb, cbArgs) {
      // TODO: Validate input

    };

    return that;
  };


  // -----
  // Public Static
  // ----------


  // -----
  // Exporting
  // ----------

  // To Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = constructor;
  // To AMD / Require.js
  } else if (typeof define !== 'undefined' && define.amd) {
    define(modulename, [], function () { return constructor; });
  // To browser's global object
  } else {
    window[modulename] = constructor;
  }
}('mute'));