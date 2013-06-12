/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global $, _, GHB, GPH, async, mute, muteScript, console */

muteScript('conversation', function (render, data) {
  'use strict';

  // Translate data.repo = username/repository to sstr/username___repository
  // Get list of branches == issues
  // - Title, time opened, time of last activity, opened/closed-status, tags

  var addError, addHTMLContent, addSVGClass, commits, commitResponse, graphEngine, nodeTpl, repo, recurseResolve, registerEventHandlers, removeSVGClass, stageOne, stageTwo, stageThree;

  commits = {};
  data.repo = data.repo.split('/', 2);
  repo = GHB.getRepo(data.repo[0], data.repo[1]);

  addError = function (e) {
    console.log('ERROR in conversation.js');
    console.log(e);
  };

  addHTMLContent = function (htmlString, sha) {
    commits[sha].htmlContent = htmlString;
  };

  addSVGClass = function ($selection, className) {
    var classes = $selection.attr('class');
    // if (!$selection.hasClass('js-selected'))
    if (classes.indexOf(className) === -1) {
      $selection.attr('class', classes + ' ' + className);
    }
  };

  // Brainfuck! Async recusion.
  // @mvo: Thanks for the hint, try to understand it :-P
  recurseResolve = function (sha, callback) {
    // If this commit is known, it's subtree is known too.
    if (commits[sha]) {
      // Exit recursion tree.
      callback();
      return;
    }
    repo.getCommit(sha, function (error, commit) {
      if (error) {
        // Exit recursion tree, aborting the surrounding recursion.
        callback(error);
        return;
      }
      commits[sha] = commit;
      var parentShas = commit.parents.map(function (parent, index) {
        return parent.sha;
      });
      async.each(
        parentShas,
        // The recursive call will receive a new callback for it's async.each.
        recurseResolve,
        function (err) {
          // Exit recursion tree.
          // If no error occured, err will evaluate to false.
          callback(err);
        }
      );
    });
  };

  registerEventHandlers = function () {
    // Selecting nodes and opening up the reply overlay.
    $('.node').click(function (e) {
      var $node, oldClasses;
      $node = $('#' + e.currentTarget.id);
      oldClasses = $node.attr('class');
      // If ctrl oder meta are hold, toggle selection state.
      if (e.ctrlKey) {
        // if (!$node.hasClass('js-selected'))
        if (oldClasses.indexOf('js-selected') === -1) {
          addSVGClass($node, 'js-selected');
        } else {
          removeSVGClass($node, 'js-selected');
        }
        return;
      }
      if (oldClasses.indexOf('js-selected') === -1) {
        addSVGClass($node, 'js-selected');
      }
      $('body').addClass('js-stopScrolling');
      $('#overlay').removeClass('hidden');
    });

    // Submitting data from reply overlay.
    $('#overlay input[type="submit"]').click(function (e) {
      e.preventDefault();
      var done, parents, headCommit;
      parents = [];
      done = function () {
        window.location.reload();
      };
      $('.js-selected input[name="sha"]').each(function () {
        var currentSha = $(this).attr('value');
        parents.push(currentSha);
        if (commits[currentSha].head) {
          headCommit = commits[currentSha].head;
        }
      });
      repo.commit(
        parents, // Parent(s)
        $('.js-selected input[name="tree"]').first().attr('value'), // Tree
        $('#overlay textarea').val(), // Commit message
        function (err, newSha) {
          if (err) { addError(err); }
          if (headCommit) {
            repo.updateHead(headCommit, newSha, function (err) {
              if (err) { addError(err); }
              done();
            });
          } else {
            repo.createRef(
              {'ref': 'refs/heads/' + newSha, 'sha': newSha},
              function (err) {
                if (err) { addError(err); }
                done();
              }
            );
          }
        }
      );
    });

    // Reset the reply overlay on reset click (and after submit).
    $('#overlay input[type="reset"]').click(function (e) {
      $('body').removeClass('js-stopScrolling');
      $('#overlay').addClass('hidden');
    });

    // NICETOHAVE: Press escape to hide overlay.
  };

  removeSVGClass = function ($selection, className) {
    var classes = $selection.attr('class');
    // if ($selection.hasClass('js-selected'))
    if (classes.indexOf(className) !== -1) {
      classes.replace(className, '').trim();
      $selection.attr('class', classes);
    }
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
      if (error) { addError(error); }
      var shas;
      // Get commit sha for each branch's head.
      shas = branches.map(function (branch, index) {
        // NICETOHAVE: Add optional prefix filter
        // if (branch.name contains prefix)
        // prefix also has to be added when new branch is created!!
        return branch.commit.sha;
      });
      async.each(
        shas,
        recurseResolve,
        function (err) {
          if (err) { addError(err); }
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
