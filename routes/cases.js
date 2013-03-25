/**
 * Script behind the cases page
 */

/*global RSN */
/*jslint indent: 2, node: true, nomen: true */
'use strict';

module.exports = function (req, res) {
  var i, file, folders, fs;

  fs = require('fs');

  try {
    folders = fs.readdirSync(RSN.dir.cases);
    res.locals.cases = {};
    for (i in folders) {
      // TODO: This could easly be made async
      file = fs.readFileSync(RSN.dir.cases + folders[i] +
                             '/description.json', 'utf-8');
      file = JSON.parse(file);
      res.locals.cases[folders[i]] = {
        id: folders[i],
        creationDate: file.creationDate,
        summary: file.summary
      };
    }
  } catch (e) {
    res.locals.error = 'Somethings wrong in the cases database.';
  }

  res.render('cases');
};
