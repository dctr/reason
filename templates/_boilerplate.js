/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global muteScript, console */

// NOTE: If this function is called, the template.ejs is already loaded.
// Thus, render(data) is NOT async!
muteScript('XXX', function (render, data) {
  'use strict';

  var templateData = {};

  // Process input from data object.
  // ===============================
  //
  // Store all data that should be available in templateData.


  // Render the template with some data object.
  // ==========================================
  //
  // If this script is called, the template and this function are fetched.
  // Thus, the call to render() is sync.
  render(templateData);


  // Operate on the rendered site.
  // =============================
  //
  // After this point, you can operate on the rendered site, e.g. register
  // event handlers or manipulate the DOM.
});