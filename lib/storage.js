/**
 * Wrapper around the git functionality
 */

/*global RSN */
/*jslint indent: 2 */ // Set indent to 2 spaces
'use strict';

/**
 * If a branch is given, it returns an object with functions on the branch.
 * If no branch is given, it returns a function that takes a branch as argument,
 * which in turn returns the object with the functions on the branch
 */
module.exports = function (repoPath, repoBranch) {
  var fs = require('fs');
  var git = require('nodegit');
  var gitRaw = git.raw;

  var branch = function (branchName) {
    // All read-only operations take an optional commitID, defaults to HEAD.
    return {
      mkdir: function (repoPath, branchName, dirName) {
        // body...
      },
      readFile: function (repoPath, branchName, fileName, commitID) {
        commitID = commitID || 'HEAD';
      },
      writeFile: function (repoPath, branchName, fileName) {
        // body...
      }
    }
  }

  if (!repoPath) {
    throw {name: 'StorageError', message: 'No repository path given.'};
  }

  if (repoBranch) {
    return branch(repoBranch);
  } else {
    return branch;
  }

}