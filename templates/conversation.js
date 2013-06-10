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

  var addHTMLContent, clickedCommit, commits, commitResponse, graphEngine, nodeTpl, repo, recurseResolve, registerEventHandlers, stageOne, stageTwo, stageThree;

  commits = {};
  data.repo = data.repo.split('/', 2);
  repo = GHB.getRepo(data.repo[0], data.repo[1]);

  addHTMLContent = function (htmlString, sha) {
    commits[sha].htmlContent = htmlString;
  };

  // Brainfuck! Async recusion.
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
      //   // TODO: Multiple partent selection. clickedCommit = []
      //   //       Those multiple partents should form an array of parent.shas.
      // }
      // TODO: push(id) if clicked is array
      clickedCommit = e.currentTarget.id;
      $('body').addClass('js-stopScrolling');
      $('#overlay').show();
    });

    $('#overlay input[type="submit"]').click(function (e) {
      e.preventDefault();
      var newCommit;
      newCommit = {};
      // TODO: Iterate over all clickedCommit
      $('#' + clickedCommit + ' .js-commitMetainfo').children(':input').each(function () {
        var child = $(this);
        newCommit[child.attr('name')] = child.attr('value');
      });
      newCommit.message = $('#overlay textarea').val();
      // TODO: For multiple partents this will be an array
      repo.commit(clickedCommit, newCommit.tree, newCommit.message, function (err, resSha) {
        if (err) { throw err; }
        if (commits[clickedCommit].head) {
          console.log('Updating ' + commits[clickedCommit].head);
          repo.updateHead(commits[clickedCommit].head, resSha, function (err) {
            if (err) { throw err; }
          });
        } else {
          repo.createRef(
            {
              'ref': 'refs/heads/' + resSha,
              'sha': resSha
            },
            function (err) {
              console.log('Creating branch');
              if (err) { throw err; }
            }
          );
        }

      });
      $('#overlay input[type="reset"]').click();
    });

    $('#overlay input[type="reset"]').click(function (e) {
      clickedCommit = undefined;
      $('body').removeClass('js-stopScrolling');
      $('#overlay').hide();
    });
  };

  // The program is divided into stages, to instead of nesting too many
  // functions as callbacks, a stage-function is provided as callback.

  stageOne = function () {
    data.drawingAreaId = 'drawingArea';
    graphEngine = GPH({
      containerDivId: data.drawingAreaId,
      nodeId: 'sha',
      nodeContent: 'htmlContent',
      rx: '5px',
      ry: '5px'
    });

    // Get all heads to start from.
    repo.getBranches(function (error, branches) {
      if (error) { throw error; }
      var shas;
      // Get commit sha for each branch's head.
      shas = branches.map(function (branch, index) {
        console.log(branch.name);
        return branch.commit.sha;
      });
      async.each(
        shas,
        recurseResolve,
        function (err) {
          if (err) { throw err; }
          var i, len;
          // Add branchname to the head commit.
          for (i = 0, len = branches.length; i < len; i += 1) {
            commits[branches[i].commit.sha].head = branches[i].name;
          }
          stageTwo();
        }
      );
    });
  };

  stageTwo = function (err) {
    var sha, i, len;
    graphEngine.addNodes(commits);
    for (sha in commits) {
      if (commits.hasOwnProperty(sha)) {
        for (i = 0, len = commits[sha].parents.length; i < len; i += 1) {
          graphEngine.addEdge(commits[sha].parents[i].sha, sha);
        }
      }
    }
    nodeTpl = mute(addHTMLContent, '/templates', '/templates');
    // Calling the renderer with a prefetch-callback. So, in stageThree,
    // the template does not need to be fetched and render is synchronously.
    nodeTpl.render('nodeContent', stageThree);
  };

  stageThree = function () {
    var sha;
    render(data);
    for (sha in commits) {
      if (commits.hasOwnProperty(sha)) {
        nodeTpl.render('nodeContent', commits[sha]);
      }
    }
    graphEngine.run();
    registerEventHandlers();
  };


  // -----
  // main
  // ----------

  stageOne();
});
