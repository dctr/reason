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

  var mainTpl, i, len, pair, searchObject, searchPairs;


  // -----
  // Render requested page
  // ----------

  searchPairs = window.location.search.substring(1).split("&");
  searchObject = {};
  for (i = 0, len = searchPairs.length; i < len; i += 1) {
    if (searchPairs[i] !== "") {
      pair = searchPairs[i].split("=");
      searchObject[window.decodeURIComponent(pair[0])] = window.decodeURIComponent(pair[1]);
    }
  }
  if (!searchObject.page) {
    // Home is default page.
    searchObject.page = 'home';
  }

  RSN.resumeSession(function (success) {
    if (success) {
      $('.js-loggedIn').removeClass('hidden');
      $('.js-loggedOut').addClass('hidden');
    } else {
      $('.js-loggedIn').addClass('hidden');
      $('.js-loggedOut').removeClass('hidden');
    }
  });

  mainTpl = mute('./templates', './templates', 'div[role="main"]');
  mainTpl.render(searchObject.page, searchObject);

  // -----
  // Register event handlers
  // ----------

  $('#login input[type="submit"]').click(function (e) {
    e.preventDefault();
    RSN.login(
      $('#login input[name="username"]').val(),
      $('#login input[name="password"]').val(),
      function (loggedIn) {
        if (loggedIn) {
          $('.js-loggedIn').removeClass('hidden');
          $('.js-loggedOut').addClass('hidden');
        } else {
          window.alert('Login failed.');
        }
      }
    );
  });

  $('#logout').click(function (e) {
    e.preventDefault();
    RSN.logout();
    $('.js-loggedIn').addClass('hidden');
    $('.js-loggedOut').removeClass('hidden');
    window.location.reload();
  });

  // Let the logout page redirect to home.
  //mainTpl.setRedirect('logout', 'home');

  // BEGIN DEBUG
  // if (RSN.isLogedIn) {
  //   mainTpl.render('conversation', {repo: 'issuetracker/ggc-one'});
  // }
});