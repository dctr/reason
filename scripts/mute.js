/*jslint browser: true, evil: true, indent: 2, nomen: true, todo: true */
/*global _, console */

/**
 * Mute - Minimal Underscore.js-based Template Engine
 *
 * A caching, client-side template engine based on Underscore's template().
 * This script exports the engine to a browsers global mute object.
 * TODO: https://developer.mozilla.org/en-US/docs/Web/Guide/DOM/Manipulating_the_browser_history?redirectlocale=en-US&redirectslug=DOM%2FManipulating_the_browser_history
 */
(function (modulename) {
  'use strict';

  var constructor, cachedScripts, muteScript, cachedTemplates, renderCompiledTemplate;

  cachedScripts = {};
  cachedTemplates = {};

  /**
   * Cache a script with a given name
   * @param  {string}   template The name of the template.
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

  /**
   * Function to export as global mute object
   *
   * This is a function creating a template engine instance for a certain CSS selector.
   * It is enrichted by "static" functions below.
   * @param  {string} selector A CSS selector defining the Element which's content should be replaced by a template.
   * @param  {string} ejsDir   URL path which contains the EJS files.
   * @param  {string} jsDir    URL path which contains the JS files.
   * @return {object}          A mute instance for the CSS selector.
   */
  constructor = function (selector, ejsDir, jsDir) {
    var that, applyTemplate, back, currentContent, forth, noBackForth, redirects, renderCompiledTemplate;

    if (typeof ejsDir !== 'string' ||
        typeof jsDir  !== 'string') {
      throw {name: 'MuteError', message: 'Invalid call of mute().'};
    }

    back = [];
    forth = [];
    redirects = {};

    // Compiles memoized templates.
    renderCompiledTemplate = function (template, data) {
      if (typeof data === 'function') {
        data();
        return;
      }
      cachedScripts[template](
        function (processedData, args) {
          if (currentContent !== back[back.length - 1]) {
            // TODO: back and forth not necessary, if rendering to function.
            back.push(currentContent);
          }
          currentContent = cachedTemplates[template](processedData);
          applyTemplate(currentContent, args);
        },
        data
      );
    };

    if (typeof selector === 'string') {
      applyTemplate = function (content) {
        document.querySelector(selector).innerHTML = content;
      };
    } else if (typeof selector === 'function') {
      applyTemplate = function (content, args) {
        selector(content, args);
      };
    }


    that = {};

    // TODO: Is it possible to use the browser (e.g. document.history.push/pop)?
    /**
     * Replace the current page with the previous one.
     * @todo Can you use the browsers history for single page apps?
     * @return {number} The number of pages in the backwards log.
     */
    that.backwards = function () {
      var upcomming = back.pop();
      if (!upcomming) { return -1; }
      forth.push(currentContent);
      currentContent = upcomming;
      applyTemplate(currentContent);
      return back.length;
    };

    /**
     * Replace the current page with the previous one after a backwards.
     * @todo Can you use the browsers history for single page apps?
     * @return {number} The number of pages in the forwards log.
     */
    that.forwards = function () {
      var upcomming = forth.pop();
      if (!upcomming) { return -1; }
      back.push(currentContent);
      currentContent = upcomming;
      applyTemplate(currentContent);
      return forth.length;
    };

    /**
     * Render a template
     * @param  {string}   template Template name (also filename without extension).
     * @param  {object}   data     A data object which will be present within the corresponding script and the template.
     * @param  {function} data     A prefetch-callback which will be called, if the XMLHttpRequests to template are finished. No rendering done!
     */
    that.render = function (template, data) {
      var ex, reqTpl;

      if (!/^[A-Za-z0-9]*$/.test(template) ||
          (data && typeof data !== 'object' && typeof data !== 'function')
          ) {
        console.log(typeof data);
        console.log(template);
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
          // TODO: Handle errors.
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

    /**
     * Sets an alias for a certain template
     * @param  {string} source The templates name.
     * @param  {string} target Which template should be displayed instead
     */
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

  /**
   * Convert <br>, <br/>, and <br /> to \n
   * @param  {string} str The source string.
   * @return {string}     The processed string
   */
  constructor.br2nl = function (str) {
    if (typeof str !== 'string') {
      throw {
        name: 'MuteError',
        message: 'Invalid call to br2nl().'
      };
    }
    return str.replace(/<br\s*\/?>/mg, '\n');
  };

  /**
   * Clear the template and script cache
   *
   * Usefull, if the templates/scripts change server-side.
   */
  constructor.clear = function () {
    cachedScripts = {};
    cachedTemplates = {};
  };

  /**
   * Convert \n to <br />
   *
   * Using self-closing br tag to be compatible with both HTML5 _and_ XHTML.
   * @param  {string} str The source string.
   * @return {string}     The processed string
   */
  constructor.nl2br = function (str) {
    if (typeof str !== 'string') {
      throw {
        name: 'MuteError',
        message: 'Invalid call to nl2br().'
      };
    }
    var breakTag = '<br />';
    return str.replace(
      /(\r\n|\n\r|\r|\n)/mg,
      breakTag + '$1'
    );
  };

  /**
   * Export the global mute object.
   */
  window[modulename] = constructor;
}('mute'));