/**
 * Declaration of stuff that should be bound to a global object.
 */

/*jslint indent: 2 */ // Set indent to 2 spaces
'use strict';

module.exports = function (rootdir) {

  // Directories
  rootdir += '/';
  var datadir = rootdir + 'app_data/';
  var casesdir = datadir + 'cases/';
  var usersdir = datadir + 'users/';

  return {
    // Variables
    blankProfile: {
      cases: [],
      tags: ['newbie']
    },
    domain: 'example.com',
    pepper: 'SvtB6XiodbPrU04+n0vcy/rsigsp3LxXf7itk97hcf0=',

    // Functions
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