/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global $, _, RSN, TPL, console */

// TODO:
// - Assign issues to milestones.
// - Allow votings for comments

TPL.cacheScript('issues', function (data, render) {
  'use strict';

  // Translate data.repo = username/repository to sstr/username___repository
  // Get list of branches == issues
  // - Title, time opened, time of last activity, opened/closed-status, tags

  var issuesRepo;

  issuesRepo = 'sstr/' + data.repo.replace('/', '___');

  render(data);
});