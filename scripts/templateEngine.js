/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global $, _, RSN, async, console */

// TODO: Refactoring: Match closureModule, give div to replace as argument.

/**
 * Mute - Minimal underscore.js-based template engine
 *
 * A caching template engine based on Underscores template() function.
 * Defines the global TPL.
 */
(function (modulename) {
  'use strict';

  var constructor, cachedScripts, cachedTemplates, renderCompiledTemplate;

  cachedScripts = {};
  cachedTemplates = {};

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
        $(selector).html(currentContent);
      });
    };


    that = {};

    // TODO: Is it possible to use the browser (e.g. document.history.push/pop)?
    that.backwards = function () {
      var upcomming = back.pop();
      if (!upcomming) { return; }
      forth.push(currentContent);
      currentContent = upcomming;
      $(selector).html(currentContent);
      return back.length;
    };

    that.forwards = function () {
      var upcomming = forth.pop();
      if (!upcomming) { return; }
      back.push(currentContent);
      currentContent = upcomming;
      $(selector).html(currentContent);
      return forth.length;
    };

    that.render = function (template, data) {
      if (redirects[template]) {
        template = redirects[template];
      }
      // If a cached template exists, the corresponding script is also cached.
      if (cachedTemplates[template]) {
        renderCompiledTemplate(template, data);
      } else {
        // TODO: Check template for [a-z]
        $.get(ejsDir + '/' + template + '.ejs', function (templateContent) {
          cachedTemplates[template] = _.template(templateContent);
          $.getScript(jsDir + '/' + template + '.js', function (res, status, jqxhr) {
            if (status !== 'success') {
              throw {name: 'LoadError', message: jqxhr};
            }
            // NOTE: The template scripts cache themselves.
            renderCompiledTemplate(template, data);
          });
        });
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

  constructor.cacheScript = function (template, script) {
    cachedScripts[template] = script;
  };

  constructor.cacheTemplate = function (template, text) {
    cachedTemplates[template] = text;
  };

  constructor.clear = function () {
    cachedScripts = {};
    cachedTemplates = {};
  };

  constructor.nl2br = function (str) {
    var breakTag = '<br />';
    return str.replace(
      /(\r\n|\n\r|\r|\n)/mg,
      breakTag + '$1'
    );
  };


  window[modulename] = constructor;
}('mute'));