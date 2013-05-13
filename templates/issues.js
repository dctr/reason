/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global $, _, GHB, RSN, TPL, console */

// TODO:
// - Assign issues to milestones.
// - Allow votings for comments

TPL.cacheScript('issues', function (data, render) {
  'use strict';

  // Translate data.repo = username/repository to sstr/username___repository
  // Get list of branches == issues
  // - Title, time opened, time of last activity, opened/closed-status, tags

  var asyncs, asyncRender, repo;

  asyncs = [];
  repo = GHB.getRepo('issuetracker', data.repo.replace('/', '___'));

  asyncs.push(function () {
    repo.listBranches(function (err, branches) {
      data.branches = {};
      _.each(branches, function (branch) {
        data.branches[branch];
      });
      asyncRender();
    });
  });

  asyncRender = _.after(asyncs.length, function () {
    console.log(data);
    render(data);
  });
  _.each(asyncs, function (fn) {
    fn();
  });

});