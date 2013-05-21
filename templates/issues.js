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

  var commits, repo, recurseCommit, startpoints;

  commits = {};
  repo = data.repo;

  recurseCommit = function (err, commit) {
    if (err) { throw err; }
    if (commits[commit.sha]) { return; }
    commits[commit.sha] = commit;
    var i;
    for (i = 0; i < commit.parents.length; i += 1) {
      repo.getCommit(commit.parents[i].sha, recurseCommit);
    }
  };

  // Get all heads to start from.
  repo.getBranches(function (err, branches) {
    // Get commit object for each branch's head.
    startpoints = _.pluck(branches, 'name');
    _.each(branches, function (branch) {
      repo.getCommit(branch.commit.sha, recurseCommit);
    });
  });

  // RENDER!
});
