/*jslint browser: true, evil: true, indent: 2, nomen: true, todo: true */
/*global _, console */

/**
 * Mute - Minimal underscore.js-based template engine
 *
 * A caching template engine based on Underscore's template() function.
 *
 */
(function (modulename) {
  'use strict';

  var constructor, cachedScripts, muteScript, cachedTemplates, renderCompiledTemplate;

  cachedScripts = {};
  cachedTemplates = {};

  muteScript = function (template, script) {
    cachedScripts[template] = script;
  };


  constructor = function (selector, ejsDir, jsDir) {
    var that, back, currentContent, forth, noBackForth, redirects, renderCompiledTemplate;

    if (typeof selector !== 'string' ||
        typeof ejsDir   !== 'string' ||
        typeof jsDir    !== 'string') {
      throw {name: 'MuteError', message: 'Invalid parameters given.'};
    }

    back = [];
    forth = [];
    redirects = {};

    // Compiles memoized templates.
    renderCompiledTemplate = function (template, data) {
      cachedScripts[template](data, function (processedData) {
        if (currentContent !== back[back.length - 1]) {
          back.push(currentContent);
        }
        currentContent = cachedTemplates[template](processedData);
        document.querySelector(selector).innerHTML = currentContent;
      });
    };


    that = {};

    // TODO: Is it possible to use the browser (e.g. document.history.push/pop)?
    that.backwards = function () {
      var upcomming = back.pop();
      if (!upcomming) { return; }
      forth.push(currentContent);
      currentContent = upcomming;
      document.querySelector(selector).innerHTML = currentContent;
      return back.length;
    };

    that.forwards = function () {
      var upcomming = forth.pop();
      if (!upcomming) { return; }
      back.push(currentContent);
      currentContent = upcomming;
      document.querySelector(selector).innerHTML = currentContent;
      return forth.length;
    };

    that.render = function (template, data) {
      var ex, reqTpl;
      if (redirects[template]) {
        template = redirects[template];
      }
      ex = {
        name: 'MuteError',
        message: 'Could not retrieve template, got an ' + this.status + '.'
      };
      // If a cached template exists, the corresponding script is also cached.
      if (cachedTemplates[template]) {
        renderCompiledTemplate(template, data);
      } else {
        // TODO: Replace with native functions.
        reqTpl = new XMLHttpRequest();
        reqTpl.open('GET', ejsDir + '/' + template + '.ejs');
        reqTpl.onload = function (e) {
          var reqScr;
          // NOTE: A 304 from the server results in a client-side 200.
          if (this.status !== 200) { throw ex; }
          cachedTemplates[template] = _.template(this.response);
          reqScr = new XMLHttpRequest();
          reqScr.open('GET', jsDir + '/' + template + '.js');
          reqScr.onload = function (e) {
            if (this.status !== 200) { throw ex; }
            eval(this.response.trim() + ';');
            renderCompiledTemplate(template, data);
          };
          reqScr.send();
        };
        reqTpl.send();
      }
    };

    that.setRedirect = function (source, target) {
      redirects[source] = target;
    };

    return that;
  };

  constructor.br2nl = function (str) {
    return str.replace(/<br\s*\/?>/mg, '\n');
  };

  constructor.clear = function () {
    cachedScripts = {};
    cachedTemplates = {};
  };

  constructor.nl2br = function (str) {
    // Using self-closing tag to be compatible with HTML5 _and_ XHTML.
    var breakTag = '<br />';
    return str.replace(
      /(\r\n|\n\r|\r|\n)/mg,
      breakTag + '$1'
    );
  };


  window[modulename] = constructor;
}('mute'));