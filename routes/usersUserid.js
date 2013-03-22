/**
 * Code behind the profile view
 */

/*jslint indent: 2 */ // Set indent to 2 spaces
'use strict';

module.exports = function (req, res) {
  var fs = require('fs');

  fs.readFile(RSN.dir.users + req.params.userid + '/profile.json',
    function (err, data) {
      if (err) {
        RSN.addError(res, err);
      } else {
        res.locals.userid = req.params.userid;
        res.locals.profile = JSON.parse(data);
      }
      res.render('usersUserid');
    }
  );
};