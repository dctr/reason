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
  $.ajaxSetup({ cache: false });

  // Let the logout page redirect to home.
  TPL.setRedirect('logout', 'home');

  // -----
  // Program
  // ----------

  // Select home per default.
  TPL.render('home');
  $('.is-loggedIn').hide();
  $('.is-loggedOut').hide();
  $('#back').attr('disabled', true);
  $('#forth').attr('disabled', true);

  RSN.resumeSession(function (success) {
    if (success) {
      $('.is-loggedIn').show();
      $('.is-loggedOut').hide();
    } else {
      $('.is-loggedIn').hide();
      $('.is-loggedOut').show();
    }
  });

  // -----
  // Register event handlers
  // ----------

  // Functionality for the nav bar.
  $('nav a').click(function (e) {
    e.preventDefault();
    $('nav a').attr('class', '');
    $(this).attr('class', 'selected');
    TPL.render($(this).attr('id'));
    $('#back').attr('disabled', false);
  });

  $('#back').click(function (e) {
    e.preventDefault();
    if (!TPL.backwards()) {
      $('#back').attr('disabled', true);
    }
    $('#forth').attr('disabled', false);
  });

  $('#forth').click(function (e) {
    e.preventDefault();
    if (!TPL.forwards()) {
      $('#forth').attr('disabled', true);
    }
    $('#back').attr('disabled', false);
  });

  $('#login input[type="submit"]').click(function (e) {
    e.preventDefault();
    RSN.login(
      $('#login input[name="username"]').val(),
      $('#login input[name="password"]').val(),
      function (loggedIn) {
        if (loggedIn) {
          $('.is-loggedIn').show();
          $('.is-loggedOut').hide();
        } else {
          window.alert('Login failure.');
        }
      }
    );
  });

  $('#logout').click(function (e) {
    e.preventDefault();
    RSN.logout();
    $('.is-loggedIn').hide();
    $('.is-loggedOut').show();
    window.location.reload();
  });

  $('#search input[type="submit"]').click(function (e) {
    e.preventDefault();
    TPL.render('loading');
    TPL.render('conversation', {repo: $('#search input[name="repo"]').val()});
    $('#back').attr('disabled', false);
  });

  // BEGIN DEBUG
  if (RSN.isLogedIn) {
    TPL.render('conversation', {repo: 'issuetracker/dctr___reason'});
  }
  $('#debug').click(function (e) {
    e.preventDefault();
    TPL.clear();
    RSN.clear();
    window.location.reload();
  });
  // END DEBUG

});