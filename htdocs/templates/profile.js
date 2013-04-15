/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global $, _, RSN, TPL, USR, console */
TPL.cacheScript('profile', function (data) {
  'use strict';

  return {
    foo: RSN.stringify(USR.profile)
  };
});