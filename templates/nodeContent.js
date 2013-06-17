/*jslint browser: true, indent: 2, nomen: true, todo: true */
/*global muteScript, console */
muteScript('nodeContent', function (render, data) {
  'use strict';

  data.author.localeDate = (new Date(data.author.date)).toLocaleString();

  render(data);
});