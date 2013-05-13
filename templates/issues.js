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
    // Get a list of branch names.
    repo.listBranches(function (err, branches) {
      var b, asyncGetRepos;
      b = [];
      // After all branches are fetched, store data sorted by date and continue.
      asyncGetRepos = _.after(branches.length, function () {
        data.branches = _.sortBy(b, function (elem) {
          return new Date(elem.committer.date).getTime();
        });
        asyncRender();
      });
      // Get commit object for each branch's head.
      _.each(branches, function (branch) {
        repo.getBranch(branch, function (err, data) {
          data.name = branch;
          b.push(data);
          asyncGetRepos();
        });
      });
    });
  });

  asyncRender = _.after(asyncs.length, function () {
    render(data);
    $('div[role="main"] a').click(function (e) {
      e.preventDefault();
      TPL.render('issue', {issue: $(this).attr('id')});
    });
  });

  _.each(asyncs, function (fn) {
    fn();
  });

});