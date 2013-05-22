/*jslint browser: true, indent: 2, node: true , nomen: true, todo: true */
/*global $, _, Github, RSN, async, console, d3 */
(function (modulename) {
  'use strict';

  var constructor = function (spec, superConstructor) {
    var that, edges, nodesObject;

    that = (superConstructor && superConstructor(spec)) || {};

    that.addEdge = function (sourceId, targetId) {
      if (!nodesObject[sourceId] || !nodesObject[targetId]) {
        throw new Error('Source or target not known.');
      }
      edges.push({
        source: nodesObject[sourceId],
        target: nodesObject[targetId]
      });
    };

    that.addNode = function (id, object) {
      nodesObject[id] = object;
    };

    that.run = function () {
      var nodes;
      nodes = d3.values(nodesObject);
    };

    return that;
  };

  // TODO: Also check for AMD / RequireJS, ...
  if (module && module.exports) {
    module.exports = constructor;
  } else {
    window[modulename] = constructor;
  }
}('GPH'));