/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global _, mute, muteScript, console */
muteScript('nodeContent', function (render, data) {
  'use strict';

  data.author.date = (new Date(data.author.date)).toLocaleString();

  render(data, data.sha);
});