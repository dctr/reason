/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global $, _, RSN, TPL, console */
TPL.cacheScript('profile', function () {
  'use strict';

  console.log(RSN.github);
  return {
    foo: 'yeah: ' + TPL.nl2br(RSN.stringify(RSN.github))
  };
});