/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global $, _, GHB, GPH, async, mute, muteScript, console */

// TODO:
// - Assign issues to milestones.
// - Allow votings for comments

muteScript('conversation', function (render, data) {
  'use strict';

  // Translate data.repo = username/repository to sstr/username___repository
  // Get list of branches == issues
  // - Title, time opened, time of last activity, opened/closed-status, tags

  var addHTMLContent, commits, graphEngine, repo, recurseResolve, registerEventHandlers;

  commits = {};
  data.repo = data.repo.split('/', 2);
  repo = GHB.getRepo(data.repo[0], data.repo[1]);

  addHTMLContent = function () {
    var htmlCallback, key, nodeTpl;
    htmlCallback = function (html, sha) {
      commits[sha].htmlContent = html;
    };
    nodeTpl = mute(htmlCallback, '/templates', '/templates');
    for (key in commits) {
      if (commits.hasOwnProperty(key)) {
        nodeTpl.render('nodeContent', commits[key]);
      }
    }
  };

  // Brainfuck! Async and recusive.
  // @mvo: Thanks for the hint, try to understand it :-P
  recurseResolve = function (sha, callback) {
    // If this commit is known, it's subtree is known.
    // Thus we can exit the recursion tree by calling the callback (aka return).
    if (commits[sha]) {
      callback();
      return;
    }
    repo.getCommit(sha, function (error, commit) {
      if (error) {
        callback(error);
        return;
      }
      // Store this commit in a global database.
      commits[sha] = commit;
      // Get the shas of all of it's parents.
      var parentShas = commit.parents.map(function (parent, index) {
        return parent.sha;
      });
      async.each(
        parentShas,
        // The recursive call will receive a new callback for it's async.each.
        recurseResolve,
        function (err) {
          // If no error occured, err will evaluate to false.
          callback(err);
        }
      );
    });
  };

  registerEventHandlers = function () {
    $('.node').click(function (e) {
      // if (e.ctrlKey || e.metaKey) {
      //   // TODO: Multiple partent selection.
      // }
      var $main, parent;
      parent = e.currentTarget.id;
      $main = $('div[role="main"]');
      // TODO: Open input field, post text to commit with partent
      //$main.addClass('js-stopScrolling');
      $main.append('<div class="js-overlay"></div>');
      $main.append('<div class="js-overoverlay"><textarea class="aligncenter"></textarea><br /><input type="button" value="cancel" />&nbsp;<input type="button" value="reply" /></div>');
      //$main.removeClass('js-stopScrolling');
    });
  };


  // -----
  // main
  // ----------

  data.drawingAreaId = 'drawingArea';
  graphEngine = GPH({
    containerDivId: data.drawingAreaId,
    nodeId: 'sha',
    nodeContent: 'message',
    rx: '5px',
    ry: '5px'
  });

  // Get all heads to start from.
  repo.getBranches(function (error, branches) {
    if (error) { throw error; }
    var shas;
    // Get commit sha for each branch's head.
    shas = branches.map(function (branch, index) {
      return branch.commit.sha;
    });
    async.each(
      shas,
      recurseResolve,
      function (err) {
        if (err) { throw err; }
        var sha, i, len;
        graphEngine.addNodes(commits);
        for (sha in commits) {
          if (commits.hasOwnProperty(sha)) {
            for (i = 0, len = commits[sha].parents.length; i < len; i += 1) {
              graphEngine.addEdge(commits[sha].parents[i].sha, sha);
            }
          }
        }
        render(data);
        // TODO: addHTMLContent is async, so graphengine is run before html is present.
        addHTMLContent();
        graphEngine.run();
        registerEventHandlers();
      }
    );
  });
});
