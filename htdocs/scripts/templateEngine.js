/**
 * A caching template engine based on Underscores template() function.
 */
/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global $, _, RSN, TPL, console */
(function () {
  'use strict';

  var TPL, renderCompiledTemplate, cachedScripts, cachedTemplates;

  TPL = {};

  cachedScripts = {};
  cachedTemplates = {};

  // Compiles templates and memoizes them.
  renderCompiledTemplate = function (template) {
    $('div[role="main"]').html(cachedTemplates[template](
      cachedScripts[template]()
    ));
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

  TPL.nl2br = function (str) {
    var breakTag = '<br />';
    return str.replace(
      /(\r\n|\n\r|\r|\n)/mg,
      breakTag + '$1'
    );
  };

  TPL.render = function (template) {
    if (cachedTemplates[template]) {
      renderCompiledTemplate(template);
    } else {
      $.get('/templates/' + template + '.ejs', function (templateContent) {
        cachedTemplates[template] = _.template(templateContent);
        $.getScript('/templates/' + template + '.js', function (data, textStatus, jqxhr) {
          if (textStatus !== 'success') {
            throw {name: 'LoadError', message: jqxhr};
          }
          renderCompiledTemplate(template);
        });
      });
    }
  };

  window.TPL = TPL;
}());