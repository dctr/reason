/**
 * Index:
 *
 * - Definition of all vars
 * - Initialization of all data vars
 * - Initialization of all function vars
 * - Registration of event handlers
 * - Script code
 */
/*global $, EJS, RSN, console */
/*jslint browser: true, indent: 2, todo: true */
(function () {
  'use strict';

  var siteChange;

  siteChange = function (newSite) {
    // TODO: Render the template for newSite.
    // DEBUG:
    newSite = 'home';
    RSN.render(newSite, {message: 'hello world'});
  };

  $(document).ready(function () {
    // Functionality for the nav bar.
    $('nav a').click(function (e) {
      e.preventDefault();
      $('nav a').attr('class', '');
      $(this).attr('class', 'selected');
      siteChange($(this).html());
    });
  });
}());