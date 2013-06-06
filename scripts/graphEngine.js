/*jslint browser: true, es5: true, indent: 2, node: true , nomen: true, todo: true */
/*global _, Github, RSN, async, console, d3, dagre, e */

/**
 * Graph layout and drawing engine using dagre and d3
 *
 * To style, use CSS.
 * The graph is in a svg element contained in a div #containerDivId.
 * All nodes get a class "node" and an "id node-<nodeId>".
 * A nodes rectangle can be styled though a ".node rect" selector.
 * A nodes content html can be styled though a ".htmllabel > div" selector.
 * All edges get a class "edge" and an id "edge-<sourceNodeId>-<targetNodeId>".
 * The lines can be styled through a ".edge > path" selector.
 * The arrowhead can be styled through a "svg marker" selector (or use your
 * drawing area id instead of svg, which would style as svg's markers).
 * Of course each class supports selectors such as ":hover".
 */
(function (modulename) {
  'use strict';

  /**
   * Creates a graph engine object with the given parameters
   * @param  {object} spec An object containing all needed parameters.
   * @return {object}      An object providing a set of graph functions.
   */
  var constructor = function (spec) {
    var that, addLabels, draw, edges, edgesArray, ensureTwoControlPoints, nodeContent, nodeId, nodeObjects, nodePadding, nodes, recalcLabels, svg, svgBBox, svgGroup, translateEdge, update;

    if (typeof spec !== 'object') {
      throw {name: 'GraphError', message: 'Parameter has to be an object.'};
    }
    if (!spec.containerDivId) {
      throw {name: 'GraphError', message: 'No containerDivId given.'};
    }
    spec.debugLevel = spec.debugLevel || 0;
    spec.rx = spec.rx || 0;
    spec.ry = spec.ry || 0;
    nodeContent = spec.nodeContent || 'content';
    nodeId = spec.nodeId || 'id';
    nodePadding = spec.nodePadding || 10;

    edgesArray = [];
    nodeObjects = {};


    addLabels = function (selection) {
      var labelGroup, foLabel;

      labelGroup = selection
        .append('g');

      labelGroup.append('rect')
        .attr('rx', spec.rx)
        .attr('ry', spec.ry);

      foLabel = labelGroup
        .append('foreignObject')
        .attr('class', 'htmllabel');

      foLabel
        .append('xhtml:div');
    };

    draw = function (nodeData, edgeData) {
      var edgeEnter, nodeEnter;

      nodes = svgGroup
        .selectAll('g .node')
        .data(nodeData, function (d) { return d[nodeId]; });

      nodeEnter = nodes
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('id', function (d) { return 'node-' + d[nodeId]; })
        .each(function (d) { d.nodePadding = 0; });

      addLabels(nodeEnter);

      nodes.exit().remove();

      edges = svgGroup
        .selectAll('g .edge')
        .data(edgeData, function (d) {
          return d.source[nodeId] + '-' + d.target[nodeId];
        });

      edgeEnter = edges
        .enter()
        .append('g')
        .attr('class', 'edge')
        .attr('id', function (d) {
          return 'edge-' + d.source[nodeId] + '-' + d.target[nodeId];
        })
        .each(function (d) { d.nodePadding = 0; });

      edgeEnter
        .append('path')
        .attr('marker-end', 'url(#arrowhead)');

      edges.exit().remove();

      recalcLabels();

      // Run the actual layout
      dagre.layout()
        .nodes(nodeData)
        .edges(edgeData)
        .debugLevel(spec.debugLevel)
        .run();

      // Ensure that we have at least two points between source and target
      edges.each(function (d) { ensureTwoControlPoints(d); });

      // Re-render
      update();

      // Size the SVG element
      svgBBox = svg.node().getBBox();
      svg.attr("width", svgBBox.width + 10);
      svg.attr("height", svgBBox.height + 10);
    };

    ensureTwoControlPoints = function (d) {
      var points, s, t;

      points = d.dagre.points;
      if (!points.length) {
        s = e.source.dagre;
        t = e.target.dagre;
        points.push({ x: Math.abs(s.x - t.x) / 2, y: Math.abs(s.y + t.y) / 2 });
      }

      if (points.length === 1) {
        points.push({ x: points[0].x, y: points[0].y });
      }
    };

    recalcLabels = function () {
      var labelGroup, foLabel, textLabel;

      labelGroup = svgGroup.selectAll('.node > g');

      foLabel = labelGroup
        .selectAll('.htmllabel')
        // TODO find a better way to get the dimensions for foreignObjects
        .attr('width', '100000');

      foLabel
        .select('div')
        .html(function (d) { return d[nodeContent]; })
        .each(function (d) {
          d.width = this.clientWidth;
          d.height = this.clientHeight;
          d.nodePadding = 0;
        });

      foLabel
        .attr('width', function (d) { return d.width; })
        .attr('height', function (d) { return d.height; });

      labelGroup
        .each(function (d) {
          var bbox = this.getBBox();
          d.bbox = bbox;
          if (d[nodeContent].length) {
            d.width = bbox.width + 2 * d.nodePadding;
            d.height = bbox.height + 2 * d.nodePadding;
          } else {
            d.width = d.height = 0;
          }
        });
    };

    // Translates all points in the edge using `dx` and `dy`.
    translateEdge = function (e, dx, dy) {
      e.dagre.points.forEach(function (p) {
        p.x += dx;
        p.y += dy;
      });
    };

    update = function () {
      nodes
        .attr('transform', function (d) {
          return 'translate(' + d.dagre.x + ',' + d.dagre.y + ')';
        })
        .selectAll('g.node rect')
        .attr('x', function (d) { return -(d.bbox.width / 2 + d.nodePadding); })
        .attr('y', function (d) { return -(d.bbox.height / 2 + d.nodePadding); })
        .attr('width', function (d) { return d.width; })
        .attr('height', function (d) { return d.height; });

      edges
        .selectAll('path')
        .attr('d', function (d) {
          var points, source, target;
          points = d.dagre.points.slice(0);
          source = dagre.util.intersectRect(d.source.dagre, points[0]);
          target = dagre.util.intersectRect(d.target.dagre, points[points.length - 1]);
          points.unshift(source);
          points.push(target);
          return d3.svg.line()
            .x(function (e) { return e.x; })
            .y(function (e) { return e.y; })
            .interpolate('linear')(points);
        });

      svgGroup
        .selectAll('.node rect')
        .attr('x', function (d) { return -d.nodePadding; })
        .attr('y', function (d) { return -d.nodePadding; })
        .attr('width', function (d) { return d.width; })
        .attr('height', function (d) { return d.height; });

      nodes
        .selectAll('.node > g')
        .attr('transform', function (d) {
          return 'translate(' + (-d.bbox.width / 2) + ',' + (-d.bbox.height / 2) + ')';
        });
    };


    that = {};

    that.addEdge = function (sourceId, targetId) {
      edgesArray.push({
        source: sourceId,
        target: targetId
      });
    };

    that.addNode = function (id, object) {
      // Actually overwriting any existing object to that id.
      nodeObjects[id] = object;
    };

    that.addNodes = function (nodes) {
      var key;
      for (key in nodes) {
        if (nodes.hasOwnProperty(key)) {
          that.addNode(key, nodes[key]);
        }
      }
    };

    that.run = function () {
      var i, len, nodesArray;

      // Replace source and target IDs in edgesArray with their actual objects.
      for (i = 0, len = edgesArray.length; i < len; i += 1) {
        if (!nodeObjects[edgesArray[i].source] || !nodeObjects[edgesArray[i].target]) {
          throw {
            name: 'GraphError',
            message: 'Source or target are not present in the current node set.'
          };
        }
        edgesArray[i].source = nodeObjects[edgesArray[i].source];
        edgesArray[i].target = nodeObjects[edgesArray[i].target];
      }
      // Translate nodeObjects into a d3 array.
      nodesArray = d3.values(nodeObjects);

      // Append the svg container to the given div.
      // TODO: Manage height dynamically
      document.getElementById(spec.containerDivId).innerHTML = '\
        <svg>\
          <defs>\
            <marker id="arrowhead"\
                    viewBox="0 0 10 10"\
                    refX="8"\
                    refY="5"\
                    markerUnits="strokeWidth"\
                    markerWidth="8"\
                    markerHeight="5"\
                    orient="auto">\
              <path d="M 0 0 L 10 5 L 0 10 z"></path>\
            </marker>\
          </defs>\
        </svg>';


      // Now start laying things out
      svg = d3.select('svg');
      svgGroup = svg.append('g').attr('transform', 'translate(5, 5)');

      draw(nodesArray, edgesArray);
    };

    return that;
  };

  window[modulename] = constructor;
}('GPH'));