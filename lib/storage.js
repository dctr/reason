/**
 * Wrapper around the git functionality
 */

/*global RSN */
/*jslint indent: 2, node: true, nomen: true */
'use strict';

/**
 * If a branch is given, it returns an object with functions on the branch.
 * If no branch is given, it returns a function that takes a branch as argument,
 * which in turn returns the object with the functions on the branch
 */
module.exports = function (repoPath, repoBranch) {
  var branch, fs, git, gitRaw;

  fs = require('fs');
  git = require('nodegit');
  gitRaw = git.raw;

  branch = function (branchName) {
    // XXX: Use repoBranch and branchName in here, but not repoBranch!
    // All read-only operations take an optional commitID, defaults to HEAD.
    return {
      mkdir: function (dirName) {
        // body...
      },
      readFile: function (fileName, commitID) {
        commitID = commitID || 'HEAD';
      },
      writeFile: function (fileName) {
        // body...
      }
    };
  };

  if (!repoPath) {
    throw {name: 'StorageError', message: 'No repository path given.'};
  }

  if (repoBranch) {
    branch = branch(repoBranch);
  }
  return branch;

};