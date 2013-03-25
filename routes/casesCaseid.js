/**
 * foo
 */

/*global RSN */
/*jslint indent: 2, node: true, nomen: true */
'use strict';

module.exports = function (req, res) {
  var folder, fs;

  fs = require('fs');

  try {
    folder = fs.readdirSync(RSN.dir.data + '/cases/' + req.params.caseid);
    res.locals.message = folder;
  } catch (e) {
    console.log(e);
    res.locals.error = 'The given case does not exist.';
  }

  res.render('casesCaseid');
};