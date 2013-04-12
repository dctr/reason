/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global $, _, RSN, TPL, console */
TPL.cacheScript('profile', function () {
  'use strict';

  return {
    foo: RSN.stringify(RSN.github)
  };
});