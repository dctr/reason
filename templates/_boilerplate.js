/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global muteScript, console */

// NOTE: If this function is called, the template.ejs is already loaded.
// Thus, render(data) is NOT async!
muteScript('XXX', function (render, data) {
  'use strict';

  var templateData = {};

  // Process input from data object.
  // ===============================


  // Render the template with some data object.
  // ==========================================
  //
  // Optional: If your mute.js instance was created with a callback function,
  // you can provide additional data to that callback by calling
  // render(templateData, callbackData)
  render(templateData);


  // Operate on the rendered site.
  // =============================
  //
  // After this point, you can operate on the rendered site, e.g. register
  // event handlers or manipulate the DOM.
});