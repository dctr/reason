/*jslint browser: true, es5: true, indent: 2, node: true , nomen: true, todo: true */
/*global _, Github, RSN, async, console, d3 */
(function (modulename) {
  'use strict';

  var constructor = function (containerDivId) {
    var that, edges, nodeObjects;

    edges = [];
    nodeObjects = {};

    that = {};

    that.addEdge = function (sourceId, targetId) {
      edges.push({
        source: sourceId,
        target: targetId
      });
    };

    that.addNode = function (id, object) {
      nodeObjects[id] = object;
    };

    that.run = function () {
      var container, fragment, i, len, nodes;

      // Replace source and target IDs in edges with their actual objects.
      for (i = 0, len = edges.length; i < len; i += 1) {
        if (!nodeObjects[edges[i].source] || !nodeObjects[edges[i].target]) {
          throw {
            name: 'GraphError',
            message: 'Source or target are not present in the current node set.'
          };
        }
        edges[i].source = nodeObjects[edges[i].source];
        edges[i].target = nodeObjects[edges[i].target];
      }
      // Translate nodeObjects into an array.
      nodes = d3.values(nodeObjects);

      document.getElementById(containerDivId).innerHTML = '\
        <svg width=0 height=0>\
          <defs>\
            <marker id="arrowhead"\
                    viewBox="0 0 10 10"\
                    refX="8"\
                    refY="5"\
                    markerUnits="strokeWidth"\
                    markerWidth="8"\
                    markerHeight="5"\
                    orient="auto"\
                    style="fill: #333">\
              <path d="M 0 0 L 10 5 L 0 10 z"></path>\
            </marker>\
          </defs>\
        </svg>';
    };

    return that;
  };

  window[modulename] = constructor;
}('GPH'));