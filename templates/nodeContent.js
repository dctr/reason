/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global _, mute, muteScript, console */
muteScript('nodeContent', function (render, data) {
  'use strict';

  render(data, data.sha);
});