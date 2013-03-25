/**
 * Code behind the profile view
 */

/*global RSN */
/*jslint indent: 2, node: true, nomen: true */
'use strict';

module.exports = function (req, res) {
  var _, fs, i, profile;

  _ = require('underscore');
  fs = require('fs');

  fs.readFile(
    RSN.dir.users + req.params.userid + '/profile.json',
    function (err, data) {
      if (err) {
        RSN.addError(res, err);
      } else {
        res.locals.userid = req.params.userid;
        _.extend(res.locals, JSON.parse(data));
      }
      res.render('usersUserid');
    }
  );
};