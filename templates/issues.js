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

  var commits, repo, resolveCommit, startpoints;

  commits = {};
  repo = GHB.getRepo('issuetracker', data.repo.replace('/', '___'));

  // Recursive function that calls itself for all parents in commit.
  resolveCommit = function (sha) {
    if (commits[sha]) { return; }
    // Prevent an other resolveCommit from resolving this sha
    // while getCommit is running (in brackground using a callback).
    commits[sha] = 1;
    repo.getCommit(sha, function (err, commit) {
      if (err) { throw err; }
      commits[sha] = commit;
      _.each(commit.parents, function (parent) {
        resolveCommit(parent.sha);
      });
    });
  };

  // Get all heads to start from.
  repo.getBranches(function (err, branches) {
    // Get commit object for each branch's head.
    startpoints = _.pluck(branches, 'name');
    _.each(branches, function (branch) {
      resolveCommit(branch.commit.sha);
    });
  });

  // RENDER!
});
