/**
 * A caching template engine based on Underscores template() function.
 * Defines the global TPL.
 */
/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global $, _, RSN, USR, console */
(function () {
  'use strict';

  var TPL, back, cachedScripts, cachedTemplates, currentContent, forth, noBackForth, redirects, renderCompiledTemplate;

  TPL = {};

  back = [];
  cachedScripts = {};
  cachedTemplates = {};
  forth = [];
  redirects = {};

  // Compiles templates and memoizes them.
  renderCompiledTemplate = function (template, data) {
    cachedScripts[template](data, function (processedData) {
      if (currentContent !== back[back.length - 1]) {
        back.push(currentContent);
      }
      currentContent = cachedTemplates[template](processedData);
      $('div[role="main"]').html(currentContent);
    });
  };

  TPL.backwards = function () {
    var upcomming = back.pop();
    if (!upcomming) { return; }
    forth.push(currentContent);
    currentContent = upcomming;
    $('div[role="main"]').html(currentContent);
    return back.length;
  };

  TPL.br2nl = function (str) {
    return str.replace(/<br\s*\/?>/mg, '\n');
  };

  TPL.cacheScript = function (template, script) {
    cachedScripts[template] = script;
  };

  TPL.cacheTemplate = function (template, text) {
    cachedTemplates[template] = text;
  };

  TPL.clear = function () {
    cachedScripts = {};
    cachedTemplates = {};
  };

  TPL.forwards = function () {
    var upcomming = forth.pop();
    if (!upcomming) { return; }
    back.push(currentContent);
    currentContent = upcomming;
    $('div[role="main"]').html(currentContent);
    return forth.length;
  };

  TPL.nl2br = function (str) {
    var breakTag = '<br />';
    return str.replace(
      /(\r\n|\n\r|\r|\n)/mg,
      breakTag + '$1'
    );
  };

  TPL.render = function (template, data) {
    if (redirects[template]) {
      template = redirects[template];
    }
    // If a cached template exists, the corresponding script is also cached.
    if (cachedTemplates[template]) {
      renderCompiledTemplate(template, data);
    } else {
      // TODO: Check template for [a-z]
      $.get('./templates/' + template + '.ejs', function (templateContent) {
        cachedTemplates[template] = _.template(templateContent);
        $.getScript('./templates/' + template + '.js', function (res, status, jqxhr) {
          if (status !== 'success') {
            throw {name: 'LoadError', message: jqxhr};
          }
          // NOTE: The template scripts cache themselves.
          renderCompiledTemplate(template, data);
        });
      });
    }
  };

  TPL.setRedirect = function (source, target) {
    redirects[source] = target;
  };

  window.TPL = TPL;
}());