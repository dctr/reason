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
$(document).ready(function () {
  'use strict';

  // Functionality for the nav bar.
  $('nav a').click(function (e) {
    e.preventDefault();
    $('nav a').attr('class', '');
    $(this).attr('class', 'selected');
    RSN.render($(this).attr('id'));
  });

  // Select home per default.
  $('#home').click();

  $('#login input[type="button"]').click(function (e) {
    e.preventDefault();
    if (
      RSN.login(
        $('#login input[name="username"]').val(),
        $('#login input[name="password"]').val()
      )
    ) {
      window.alert('success');
    } else {
      window.alert('failure');
    }
  });
});