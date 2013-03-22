/**
 * Declaration of stuff that should be bound to a global object.
 */

/*jslint indent: 2 */ // Set indent to 2 spaces
'use strict';

module.exports = function (rootdir) {
  var strftime = require('strftime');

  // Directories
  rootdir += '/';
  var datadir = rootdir + 'app_data/';
  var casesdir = datadir + 'cases/';
  var usersdir = datadir + 'users/';

  return {
    // Variables
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
      var now = strftime('%FT%T%z')
      return {
        cases: [],
        description: 'The user has not given a self-description yet.',
        since: now,
        tags: ['newbie']
      }
    },
    stringify: function (object) {
      return JSON.stringify(object, null, 2);
    },

    // Directories
    appdir: rootdir,
    datadir: datadir,
    casesdir: casesdir,
    usersdir: usersdir
  };
};