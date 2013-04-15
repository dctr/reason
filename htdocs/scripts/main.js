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

  // Functionality for the nav bar.
  $('nav a').filter(':not(#logout)').click(function (e) {
    e.preventDefault();
    $('nav a').attr('class', '');
    $(this).attr('class', 'selected');
    TPL.render($(this).attr('id'));
  });

  // Select home per default.
  $('#home').click();

  if (RSN.resumeSession()) {
    $('#logedIn').attr('class', '');
    $('#logedOut').attr('class', 'hidden');
  }

  $('#login input[type="submit"]').click(function (e) {
    e.preventDefault();
    RSN.login(
      $('#login input[name="username"]').val(),
      $('#login input[name="password"]').val(),
      function (logedIn) {
        if (logedIn) {
          $('#logedIn').attr('class', '');
          $('#logedOut').attr('class', 'hidden');
        } else {
          window.alert('Login failure.');
        }
      }
    );
  });

  $('#logout').click(function (e) {
    e.preventDefault();
    RSN.logout();
    $('#logedIn').attr('class', 'hidden');
    $('#logedOut').attr('class', '');
  });
});