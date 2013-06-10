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
/*global $, _, RSN, mute, console */
$(document).ready(function () {
  'use strict';

  // -----
  // Settings
  // ----------

  var mainTpl = mute('div[role="main"]', '/templates', '/templates');

  // -----
  // Program
  // ----------

  // Select home per default.
  $('#overlay').hide();
  mainTpl.render('home');
  $('.js-loggedIn').hide();
  $('.js-loggedOut').hide();
  $('#back').attr('disabled', true);
  $('#forth').attr('disabled', true);

  // Let the logout page redirect to home.
  mainTpl.setRedirect('logout', 'home');

  RSN.resumeSession(function (success) {
    if (success) {
      $('.js-loggedIn').show();
      $('.js-loggedOut').hide();
    } else {
      $('.js-loggedIn').hide();
      $('.js-loggedOut').show();
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
    mainTpl.render($(this).attr('id'));
    $('#back').attr('disabled', false);
  });

  $('#back').click(function (e) {
    e.preventDefault();
    if (!mainTpl.backwards()) {
      $('#back').attr('disabled', true);
    }
    $('#forth').attr('disabled', false);
  });

  $('#forth').click(function (e) {
    e.preventDefault();
    if (!mainTpl.forwards()) {
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
          $('.js-loggedIn').show();
          $('.js-loggedOut').hide();
        } else {
          window.alert('Login failure.');
        }
      }
    );
  });

  $('#logout').click(function (e) {
    e.preventDefault();
    RSN.logout();
    $('.js-loggedIn').hide();
    $('.js-loggedOut').show();
    window.location.reload();
  });

  $('#search input[type="submit"]').click(function (e) {
    e.preventDefault();
    mainTpl.render('loading');
    mainTpl.render('conversation', {repo: $('#search input[name="repo"]').val()});
    $('#back').attr('disabled', false);
  });

  // BEGIN DEBUG
  if (RSN.isLogedIn) {
    mainTpl.render('conversation', {repo: 'issuetracker/ggc-one'});
  }
  $('#debug').click(function (e) {
    e.preventDefault();
    mute.clear();
    RSN.clear();
    window.location.reload();
  });
  // END DEBUG

});