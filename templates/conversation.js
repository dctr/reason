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

  var addHTMLContent, commits, commitResponse, graphEngine, nodeTpl, repo, recurseResolve, registerEventHandlers, stageOne, stageTwo, stageThree;

  commits = {};
  data.repo = data.repo.split('/', 2);
  repo = GHB.getRepo(data.repo[0], data.repo[1]);

  addHTMLContent = function (htmlString, sha) {
    commits[sha].htmlContent = htmlString;
  };

  // TODO: addSVGClass, removeSVGClass

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
      var $node, oldClasses;
      $node = $('#' + e.currentTarget.id);
      oldClasses = $node.attr('class');
      // If ctrl oder meta are hold, toggle selection state.
      if (e.ctrlKey) {
        // if (!$node.hasClass('js-selected'))
        if (oldClasses.indexOf('js-selected') === -1) {
          $node.attr('class', oldClasses + ' js-selected');
        } else {
          $node.attr('class', oldClasses.replace('js-selected', '').trim());
        }
        return;
      }
      if (oldClasses.indexOf('js-selected') === -1) {
        $node.attr('class', oldClasses + ' js-selected');
      }
      $('body').addClass('js-stopScrolling');
      $('#overlay').show();
    });

    $('#overlay input[type="submit"]').click(function (e) {
      e.preventDefault();
      var done, parents, headCommit;
      parents = [];
      done = function () {
        $('#overlay input[type="reset"]').click();
        // TODO: redraw
      };
      $('.js-selected input[name="sha"]').each(function () {
        var currentSha = $(this).attr('value');
        parents.push(currentSha);
        if (commits[currentSha].head) {
          headCommit = commits[currentSha].head;
        }
      });
      // TODO: For multiple partents this will be an array
      repo.commit(
        parents,
        $('.js-selected input[name="tree"]').first().attr('value'),
        $('#overlay textarea').val(),
        function (err, newSha) {
          if (err) { throw err; }
          // TODO: Only take one of the clickedCommits if muliple are used.
          if (headCommit) {
            console.log('Updating ' + headCommit);
            repo.updateHead(headCommit, newSha, function (err) {
              if (err) { throw err; }
              done();
            });
          } else {
            repo.createRef(
              {'ref': 'refs/heads/' + newSha, 'sha': newSha},
              function (err) {
                console.log('Creating branch');
                if (err) { throw err; }
                done();
              }
            );
          }
        }
      );
    });

    $('#overlay input[type="reset"]').click(function (e) {
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
        // TODO: Add optional prefix filter
        // if (branch.name contains prefix)
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

  // function foo() {
  //   console.log(clickedCommits);
  //   setTimeout(function foocaller() {
  //     foo();
  //   }, 2000);
  // }
  // foo();

});
