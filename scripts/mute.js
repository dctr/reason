/*jslint browser: true, evil: true, indent: 2, nomen: true, todo: true */
/*global _, console */

/**
 * Mute - Minimal Underscore.js-based Template Engine
 *
 * A caching, client-side template engine based on Underscore's template().
 * This script exports the engine to a browsers global mute object.
 */
(function (modulename) {
  'use strict';

  var constructor, cachedScripts, muteScript, cachedTemplates, renderCompiledTemplate;

  cachedScripts = {};
  cachedTemplates = {};

  /**
   * Cache a script with a given name
   * @param  {string} template The name of the template.
   * @param  {function} script   The function to be executed on template execution.
   */
  muteScript = function (template, script) {
    if (!/^[A-Za-z0-9]*$/.test(template) ||
        typeof script !== 'function') {
      throw {
        name: 'MuteError',
        message: 'Invalid call to muteScript().'
      };
    }
    cachedScripts[template] = script;
  };


  constructor = function (selector, ejsDir, jsDir) {
    var that, back, currentContent, forth, noBackForth, redirects, renderCompiledTemplate;

    if (typeof selector !== 'string' ||
        typeof ejsDir   !== 'string' ||
        typeof jsDir    !== 'string') {
      throw {name: 'MuteError', message: 'Invalid call of mute().'};
    }

    back = [];
    forth = [];
    redirects = {};

    // Compiles memoized templates.
    renderCompiledTemplate = function (template, data) {
      cachedScripts[template](
        function (processedData) {
          if (currentContent !== back[back.length - 1]) {
            back.push(currentContent);
          }
          currentContent = cachedTemplates[template](processedData);
          document.querySelector(selector).innerHTML = currentContent;
        },
        data
      );
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

      if (!/^[A-Za-z0-9]*$/.test(template) ||
          (data && typeof data !== 'object')
          ) {
        throw {
          name: 'MuteError',
          message: 'Invalid call to render().'
        };
      }
      data = data || {};
      if (redirects[template]) {
        template = redirects[template];
      }
      ex = {
        name: 'MuteError',
        message: 'Could not retrieve template.'
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
      if (!/^[A-Za-z0-9]*$/.test(source) ||
          !/^[A-Za-z0-9]*$/.test(target)) {
        throw {
          name: 'MuteError',
          message: 'Invalid call to setRedirect().'
        };
      }
      redirects[source] = target;
    };

    return that;
  };

  constructor.br2nl = function (str) {
    if (typeof str !== 'string') {
      throw {
        name: 'MuteError',
        message: 'Invalid call to br2nl().'
      };
    }
    return str.replace(/<br\s*\/?>/mg, '\n');
  };

  constructor.clear = function () {
    cachedScripts = {};
    cachedTemplates = {};
  };

  constructor.nl2br = function (str) {
    if (typeof str !== 'string') {
      throw {
        name: 'MuteError',
        message: 'Invalid call to nl2br().'
      };
    }
    // Using self-closing tag to be compatible with HTML5 _and_ XHTML.
    var breakTag = '<br />';
    return str.replace(
      /(\r\n|\n\r|\r|\n)/mg,
      breakTag + '$1'
    );
  };


  window[modulename] = constructor;
}('mute'));