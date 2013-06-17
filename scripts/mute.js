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

  var constructor, parallel;

  // From ypocat / async-mini
  parallel = function (funcs, cb) {
    // TODO: Refactor for arrays only
    var c, errs, has_errs, k, next, ress;
    var global = global || {};
    var process = process || {};
    next = global.setImmediate || process.nextTick || setTimeout;
    c = typeof funcs === 'object' ?
        Object.keys(funcs).length :
        funcs.length;
    errs = {};
    has_errs = false;
    ress = {};
    if (!c) { cb(null, ress); }
    for (k in funcs) {
      (function () {
        var f, id;
        f = funcs[k];
        id = k;
        next(function () {
          f(function (err, res) {
            if (err) {
              errs[id] = err.stack || err;
              has_errs = true;
            }
            if (res !== undefined) { ress[id] = res; }
            c -= 1;
            if (c === 0) { cb(has_errs ? errs : null, ress); }
          });
        });
      }());
    }
  };

  // -----
  // Private Static
  // ----------

  constructor = function (ejsDir, jsDir, target) {
    var that, cache, cachedEjs, cachedScripts, cachedTemplates, muteScript, renderCompiledTemplate, request, resolve;

    // -----
    // Validate input
    // ----------

    ejsDir = ejsDir || '/templates';
    jsDir = jsDir || '/templates';

    cachedEjs = {};
    cachedScripts = {};
    cachedTemplates = {};


    // -----
    // Private non-static
    // ----------

    // Cache the raw ejs in cachedEjs and the script in cachedScripts.
    cache = function (tplName, cb) {
      if (cachedEjs[tplName]) { cb(); }
      parallel(
        [
          function (pcb) {
            request(ejsDir + '/' + tplName + '.ejs', pcb);
          },
          function (pcb) {
            request(jsDir + '/' + tplName + '.js', pcb);
          }
        ],
        function (err, ress) {
          if (err) { return cb(err); }
          cachedEjs[tplName] = ress[0];
          // NOTE: Scripts cache themselves through a call to muteScript.
          eval(ress[1].trim() + ';');
          cb();
        }
      );
    };

    muteScript = function (tplName, func) {
      cachedScripts[tplName] = func;
    };

    renderCompiledTemplate = function (tplName, tplArgs, cb, cbArgs) {
      cachedScripts[tplName](
        function (processedTplArgs) {
          var html;
          html = cachedTemplates[tplName](processedTplArgs);
          if (typeof target !== 'undefined') { document.querySelector(target).innerHTML = html; }
          cb(undefined, html, cbArgs);
        },
        tplArgs
      );
    };

    request = function (url, cb) {
      var xhr;
      // NOTE: A 304 from the server results in a client-side 200.
      xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onload = function (e) {
        if (this.status !== 200) {
          cb(new Error('Failed to retrieve ' + url + '.'));
        } else {
          cb(undefined, this.response);
        }
      };
      xhr.send();
    };

    resolve = function (ejs, cb) {
      var funcs, match, pattern, tplName;
      funcs = [];
      // match "<% include tplName %>"
      pattern = /<%\s*include\s*(.*?)\s*%>/g;
      while (true) {
        match = pattern.exec(ejs);
        if (!match) { break; }
        // [0] Full match string
        // [1] tplName (Capture group 1)
        // Match is an object reference, thus the needed content has to be copied as the objet mutates.
        tplName = match[1];
        funcs.push(function (pcb) {
          cache(tplName, pcb);
        });
      }
      parallel(
        funcs,
        function (err, ress) {
          if (err) { return cb(err); }
          var resEjs;
          resEjs = ejs.replace(
            pattern,
            function (match, tplName) {
              return cachedEjs[tplName];
            }
          );
          cb(undefined, resEjs);
        }
      );
    };


    // -----
    // Public non-static
    // ----------

    that = {};

    that.render = function (tplName, tplArgs, cb, cbArgs) {
      // TODO: Validate input
      if (cachedTemplates[tplName]) {
        return renderCompiledTemplate(tplName, tplArgs, cb, cbArgs);
      }
      cache(tplName, function (err) {
        if (err) { return cb(err, undefined, cbArgs); }
        resolve(cachedEjs[tplName], function (err, res) {
          cachedTemplates[tplName] = _.template(res);
          renderCompiledTemplate(tplName, tplArgs, cb, cbArgs);
        });
      });
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