/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global _, mute, muteScript, console */

// NOTE: If this function is called, the template.ejs is already loaded.
// Thus, render(data) is NOT async!
muteScript('XXX', function (render, data) {
  'use strict';

  render(data);
  // Optionally, you can provide additional information to a callback.
  //render(data, callbackArgs);
});