/*jslint browser: true, es5: true, indent: 2, node: true , nomen: true, todo: true */
/*global _, Github, RSN, async, console, d3, dagre */
(function (modulename) {
  'use strict';

  var constructor = function (spec) {
    // spec: containerDivId, nodePadding, debugLevel
    var that, debugLevel, edgesArray, nodeContent, nodeId, nodeObjects, nodePadding, spline;


    if (!spec.containerDivId) {
      throw {name: 'GraphError', message: 'No containerDivId given.'};
    }
    debugLevel = spec.debugLevel || 0;
    nodeId = spec.nodeId || 'id';
    nodeContent = spec.nodeContent || 'content';
    nodePadding = spec.nodePadding || 10;

    edgesArray = [];
    nodeObjects = {};


    spline = function (e) {
      var points, source, target;
      points = e.dagre.points.slice(0);
      source = dagre.util.intersectRect(e.source.dagre, points[0]);
      target = dagre.util.intersectRect(e.target.dagre, points[points.length - 1]);
      points.unshift(source);
      points.push(target);
      return d3.svg.line()
        .x(function (d) { return d.x; })
        .y(function (d) { return d.y; })
        .interpolate("linear")(points);
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
      var container, edges, fragment, i, labels, len, nodes, nodesArray, rects, svg, svgBBox, svgGroup;

      // TODO: Calculate max width of the tree, get the width of the
      // containerDiv, set containerDiv.width / treeWidth as max width of an
      // object in the tree.

      console.log(JSON.stringify(edgesArray, null, 2));

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
      console.log(JSON.stringify(nodeObjects, null, 2));

      // Append the svg container to the given div.
      document.getElementById(spec.containerDivId).innerHTML = '\
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


      // Now start laying things out
      svg = d3.select('svg');
      svgGroup = svg.append('g').attr('transform', 'translate(5, 5)');

      // `nodes` is center positioned for easy layout later
      nodes = svgGroup
        .selectAll('g .node')
        .data(nodesArray)
        .enter()
          .append('g')
          .attr('class', 'node')
          .attr('id', function (d) { return 'node-' + d[nodeId]; });

      edges = svgGroup
        .selectAll('path .edge')
        .data(edgesArray)
        .enter()
          .append('path')
          .attr('class', 'edge')
          .attr('marker-end', 'url(#arrowhead)');

      // Append rectangles to the nodes. We do this before laying out the text
      // because we want the text above the rectangle.
      rects = nodes.append('rect');

      // Append text
      labels = nodes
        .append('text')
          .attr('text-anchor', 'middle')
          .attr('x', 0);

      labels
        .append('tspan')
        .attr('x', 0)
        .attr('dy', '1em')
        .text(function (d) { return d[nodeContent]; });

      // We need width and height for layout.
      labels.each(function (d) {
        var bbox = this.getBBox();
        d.bbox = bbox;
        d.width = bbox.width + 2 * nodePadding;
        d.height = bbox.height + 2 * nodePadding;
      });

      // Rects' position and size relative to surrounding g
      rects
        .attr('x', function (d) { return -(d.bbox.width / 2 + nodePadding); })
        .attr('y', function (d) { return -(d.bbox.height / 2 + nodePadding); })
        .attr('width', function (d) { return d.width; })
        .attr('height', function (d) { return d.height; });

      labels
        .attr('x', function (d) { return -d.bbox.width / 2; })
        .attr('y', function (d) { return -d.bbox.height / 2; });

      // Create the layout and get the graph
      dagre.layout()
        .nodeSep(50)
        .edgeSep(10)
        .rankSep(50)
        .nodes(nodesArray)
        .edges(edgesArray)
        .debugLevel(debugLevel)
        .run();

      nodes.attr('transform', function (d) {
        return 'translate(' + d.dagre.x + ',' + d.dagre.y + ')';
      });

      // Ensure that we have at least two points between source and target
      edges.each(function (d) {
        var points, s, t;
        points = d.dagre.points;
        if (!points.length) {
          s = d.source.dagre;
          t = d.target.dagre;
          points.push({ x: (s.x + t.x) / 2, y: (s.y + t.y) / 2 });
        }

        if (points.length === 1) {
          points.push({ x: points[0].x, y: points[0].y });
        }
      });

      edges
        // Set the id. of the SVG element to have access to it later
        .attr('id', function (e) { return e.dagre.id; })
        .attr('d', function (e) { return spline(e); });

      // Resize the SVG element
      svgBBox = svg.node().getBBox();
      svg.attr('width', svgBBox.width + 10);
      svg.attr('height', svgBBox.height + 10);
    };

    return that;
  };

  window[modulename] = constructor;
}('GPH'));