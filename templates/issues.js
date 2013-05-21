/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global $, _, GHB, RSN, TPL, async, console */

// TODO:
// - Assign issues to milestones.
// - Allow votings for comments

TPL.cacheScript('issues', function (data, render) {
  'use strict';

  // Translate data.repo = username/repository to sstr/username___repository
  // Get list of branches == issues
  // - Title, time opened, time of last activity, opened/closed-status, tags

  var commits, repo, recurseResolve, startpoints;

  commits = {};
  repo = GHB.getRepo(data.repo[0], data.repo[1]);

  // Warning, brainfuck! Async and recusive!
  // @mvo: Thanks for the hint, try to understand this :-P
  recurseResolve = function (sha, callback) {
    // If this commit is known, it's subtree is known.
    // Thus we can exit the recursion tree by calling the callback (aka return).
    if (commits[sha]) { callback(); }
    repo.getCommit(sha, function (error, commit) {
      if (error) { callback(error); }
      // Store this commit in a global database.
      commits[sha] = commit;
      // Get the shas of all of it's parents.
      var parentShas = _.pluck(commit.parents, 'sha');
      async.each(
        parentShas,
        // The recursive call will receive a new callback for it's async.each.
        recurseResolve,
        function (err) {
          callback(err);
        }
      );
    });
  };

  // Get all heads to start from.
  repo.getBranches(function (error, branches) {
    if (error) { throw error; }
    var shas;
    // Get commit object for each branch's head.
    startpoints = _.pluck(branches, 'name');
    shas = _.map(branches, function (branch, index) {
      return branch.commit.sha;
    });
    async.each(
      shas,
      recurseResolve,
      function (err) {
        if (err) { throw err; }
        // TODO: apply gained info on data object.
        console.log(commits);
        render(data);
      }
    );
  });
});
