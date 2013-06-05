/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global $, _, GHB, RSN, mute, async, console */
mute.cacheScript('profile', function (data, render) {
  'use strict';

  var user = GHB.getUser();

  async.parallel(
    {
      user: function (callback) {
        user.show(null, function (err, data) {
          callback(err, data);
        });
      },
      followers: function (callback) {
        user.followers(null, function (err, data) {
          callback(err, data);
        });
      },
      following: function (callback) {
        user.following(null, function (err, data) {
          callback(err, data);
        });
      }
    },
    function (err, results) {
      // TODO: Catch err
      render({data: results});
    }
  );
});