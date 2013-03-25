/**
 * Declaration of stuff that should be bound to a global object.
 */

/*global RSN */
/*jslint indent: 2, node: true, nomen: true */
'use strict';

module.exports = function (rootdir) {
  var casesdir, datadir, strftime, usersdir;

  strftime = require('strftime');

  // Directories
  rootdir += '/';
  datadir = rootdir + 'app_data/';
  casesdir = datadir + 'cases/';
  usersdir = datadir + 'users/';

  return {
    // Variables
    dir: {
      app: rootdir,
      data: datadir,
      cases: casesdir,
      users: usersdir
    },
    domain: 'example.com',
    pepper: 'SvtB6XiodbPrU04+n0vcy/rsigsp3LxXf7itk97hcf0=',

    // Functions
    addError: function (res, e) {
      if (!res.locals.error) {
        res.locals.error = [];
      }
      // To go productive reduce this output!
      res.locals.error.push(this.stringify(e));
    },
    blankProfile: function () {
      var now = strftime('%FT%T%z');
      return {
        cases: [],
        description: 'The user has not given a self-description yet.',
        since: now,
        tags: ['newbie']
      };
    },
    stringify: function (object) {
      return JSON.stringify(object, null, 2);
    }
  };
};