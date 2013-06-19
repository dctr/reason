/*jslint browser: true, es5: true, indent: 2, node: true, nomen: true, todo: true */
/*global _, define, console */

/**
 * Minimalistic underscore.js-based template engine.
 *
 * @author David Christ <david.christ@uni-trier.de>
 * @license ./LICENSE MIT License
 * @version 2.0
 */
(function (modulename) {
  'use strict';

  // TODO: Make node.js compatible.

  var constructor, parallel;

  // Similar to async.parallel, but without loading all of async.
  // From https://github.com/ypocat/async-mini
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

  // The construtor function that will be exported as mute().
  constructor = function (ejsDir, jsDir, target) {
    var that, cache, cachedEjs, cachedScripts, cachedTemplates, muteScript, renderCompiledTemplate, request, resolve;

    // -----
    // Validate input
    // ----------

    // TODO: Check for validity (typeof (e)jsDir === string), target undefined or non-empty string

    ejsDir = ejsDir || '/templates';
    jsDir = jsDir || '/templates';

    cachedEjs = {};
    cachedScripts = {};
    cachedTemplates = {};


    // -----
    // Private non-static
    // ----------

    // Cache a raw EJS in cachedEjs and it's script in cachedScripts.
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
          // TODO: Check if ress[1] empty or cachedScripts[tplName] is a function (the now cached one). Or store a NOP instead.
          if (err) { return cb(err); }
          cachedEjs[tplName] = ress[0];
          // NOTE: Scripts cache themselves through a call to muteScript.
          eval(ress[1].trim() + ';');
          cb();
        }
      );
    };

    // This function is called by the template JavaScrips to cache themselves.
    muteScript = function (tplName, func) {
      // TODO: Check if func is function
      cachedScripts[tplName] = func;
    };

    // Renders a readyly cached and compiled template.
    renderCompiledTemplate = function (tplName, tplArgs, cb, cbArgs) {
      try {
        cachedScripts[tplName](
          function (processedTplArgs) {
            var html = cachedTemplates[tplName](processedTplArgs);
            if (target) { document.querySelector(target).innerHTML = html; }
            if (cb) { cb(undefined, html, cbArgs); }
          },
          tplArgs
        );
      } catch (ex) {
        // Call to template script failed.
        cb(ex, undefined, cbArgs);
      }
    };

    // Load a file from a given URL.
    // TODO: To be node-compatible, this function has to do file-io if run in node.js.
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

    // Resolve includes in EJS files.
    // From http://emptysqua.re/blog/adding-an-include-tag-to-underscore-js-templates/
    resolve = function (ejs, cb) {
      var funcs, match, pattern, tplName;
      funcs = [];
      // Matches "<% include tplName %>"
      pattern = /<%\s*include\s*(.*?)\s*%>/g;
      while (true) {
        match = pattern.exec(ejs);
        if (!match) { break; }
        // [0] Full match string
        // [1] tplName (Capture group 1)
        // Match is an object reference, thus the needed content has to be copied as the objet mutates.
        tplName = match[1];
        // Construct functions that load templates.
        funcs.push(function (pcb) {
          cache(tplName, pcb);
        });
      }
      // Load all templates in parallel, resolve content afterwards.
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

    // Render a template with a given name and given data.
    // A callback can be called with the result, additional arguments are forwarded.
    that.render = function (tplName, tplArgs, cb) {
      // TODO: Validate input
      // TODO: Do not render if tplArgs === 'prefetch'
      var cbArgs = Array.prototype.slice.call(arguments, 3);
      if (cachedTemplates[tplName]) {
        if (tplArgs !== 'prefetch') {
          renderCompiledTemplate(tplName, tplArgs, cb, cbArgs);
        } else {
          cb(undefined, undefined, cbArgs);
        }
        return;
      }
      cache(tplName, function (err) {
        if (err) { return cb(err, undefined, cbArgs); }
        resolve(cachedEjs[tplName], function (err, res) {
          cachedTemplates[tplName] = _.template(res);
          if (tplArgs !== 'prefetch') {
            renderCompiledTemplate(tplName, tplArgs, cb, cbArgs);
          } else {
            cb(undefined, undefined, cbArgs);
          }
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
  // WARN: Not ready yet!
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