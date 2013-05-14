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

  var repo;

  repo = GHB.getRepo('issuetracker', data.repo.replace('/', '___'));

  repo.listBranches(function (err, branches) {
    var b, _afterGotBranches;
    b = [];
    // After all branches are fetched, store data sorted by date and continue.
    _afterGotBranches = _.after(branches.length, function () {
      data.branches = _.sortBy(b, function (elem) {
        return new Date(elem.committer.date).getTime();
      });
      render(data);
      $('div[role="main"] a').click(function (e) {
        e.preventDefault();
        TPL.render('issue', {issue: $(this).attr('id')});
      });
    });
    // Get commit object for each branch's head.
    _.each(branches, function (branch) {
      repo.getBranch(branch, function (err, data) {
        data.name = branch;
        b.push(data);
        _afterGotBranches();
      });
    });
  });
});