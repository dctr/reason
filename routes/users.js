/**
 * Script behind the users page
 */

/*global RSN */
/*jslint indent: 2, node: true, nomen: true */
'use strict';

module.exports = function (req, res) {
  var file, folders, fs, i;

  fs = require('fs');

  try {
    folders = fs.readdirSync(RSN.dir.data + '/users');
    res.locals.users = {};
    for (i in folders) {
      // TODO: This could easly be made async
      file = fs.readFileSync(RSN.dir.users + folders[i] + '/profile.json');
      file = JSON.parse(file);
      res.locals.users[folders[i]] = {
        id: folders[i],
        tags: file.tags,
        cases: file.cases
      };
    }
  } catch (e) {
    RSN.addError(res, e);
  }

  res.render('users');
};