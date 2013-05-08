/**
 * Index:
 *
 * - Definition of all vars
 * - Initialization of all data vars
 * - Initialization of all function vars
 * - Registration of event handlers
 * - Script code
 */
/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global $, _, RSN, TPL, console */
$(document).ready(function () {
  'use strict';

  // -----
  // Settings
  // ----------

  // Turn caching off globally.
  $.ajaxSetup({ cache: true });

  // Let the logout page redirect to home.
  TPL.setRedirect('logout', 'home');

  // -----
  // Register event handlers
  // ----------

  // Functionality for the nav bar.
  $('nav a').click(function (e) {
    e.preventDefault();
    $('nav a').attr('class', '');
    $(this).attr('class', 'selected');
    TPL.render($(this).attr('id'));
  });

  $('#login input[type="submit"]').click(function (e) {
    e.preventDefault();
    RSN.login(
      $('#login input[name="username"]').val(),
      $('#login input[name="password"]').val(),
      function (loggedIn) {
        if (loggedIn) {
          $('.loggedIn').show();
          $('.loggedOut').hide();
        } else {
          window.alert('Login failure.');
        }
      }
    );
  });

  $('#logout').click(function (e) {
    e.preventDefault();
    RSN.logout();
    $('.loggedIn').hide();
    $('.loggedOut').show();
    $('#home').click();
  });

  // -----
  // Program
  // ----------

  // Select home per default.
  $('#home').click();

  RSN.resumeSession(function (success) {
    if (success) {
      $('.loggedIn').show();
      $('.loggedOut').hide();
    } else {
      $('.loggedIn').hide();
      $('.loggedOut').show();
    }
  });
});