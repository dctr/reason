/*jslint browser: true, es5: true, indent: 2, node: true , nomen: true, todo: true */
/*global _, Github, RSN, async, console, d3, dagre, e */

/**
 * Graph layout and drawing engine using dagre and d3
 * To style, use: TODO
 *
 * @param  {[type]} modulename [description]
 * @return {[type]}            [description]
 */
(function (modulename) {
  'use strict';

  var constructor = function (spec) {
    // spec: containerDivId, nodePadding, debugLevel
    var that, addLabels, debugLevel, draw, edges, edgesArray, ensureTwoControlPoints, nodeContent, nodeId, nodeObjects, nodePadding, nodes, recalcLabels, svg, svgGroup, translateEdge, update;


    if (!spec.containerDivId) {
      throw {name: 'GraphError', message: 'No containerDivId given.'};
    }
    debugLevel = spec.debugLevel || 0;
    nodeId = spec.nodeId || 'id';
    nodeContent = spec.nodeContent || 'content';
    nodePadding = spec.nodePadding || 10;

    edgesArray = [];
    nodeObjects = {};


    addLabels = function (selection) {
      var labelGroup, foLabel;

      labelGroup = selection
        .append("g")
        .attr("class", "label");

      labelGroup.append("rect");

      foLabel = labelGroup
        .filter(function (d) { return d.label[0] === "<"; })
        .append("foreignObject")
        .attr("class", "htmllabel");

      foLabel
        .append("xhtml:div")
        .style("float", "left");

      labelGroup
        .filter(function (d) { return d.label[0] !== "<"; })
        .append("text");
    };

    draw = function (nodeData, edgeData) {
      var edgeEnter, nodeEnter;

      nodes = svgGroup
        .selectAll("g .node")
        .data(nodeData, function (d) { return d.id; });

      nodeEnter = nodes
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("id", function (d) { return "node-" + d.id; })
        .each(function (d) { d.nodePadding = 10; });

      nodeEnter.append("rect");
      addLabels(nodeEnter);
      nodes.exit().remove();

      edges = svgGroup
        .selectAll("g .edge")
        .data(edgeData, function (d) { return d.id; });

      edgeEnter = edges
        .enter()
        .append("g")
        .attr("class", "edge")
        .attr("id", function (d) { return "edge-" + d.id; })
        .each(function (d) { d.nodePadding = 0; });

      edgeEnter
        .append("path")
        .attr("marker-end", "url(#arrowhead)");

      addLabels(edgeEnter);
      edges.exit().remove();

      recalcLabels();

      // Run the actual layout
      dagre.layout()
        .nodes(nodeData)
        .edges(edgeData)
        .debugLevel(0)
        .run();

      // Ensure that we have at least two points between source and target
      edges.each(function (d) { ensureTwoControlPoints(d); });

      // Re-render
      update();
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

      labelGroup = svgGroup.selectAll("g.label");

      foLabel = labelGroup
        .selectAll(".htmllabel")
        // TODO find a better way to get the dimensions for foriegnObjects
        .attr("width", "100000");

      foLabel
        .select("div")
        .html(function (d) { return d.label; })
        .each(function (d) {
          d.width = this.clientWidth;
          d.height = this.clientHeight;
          d.nodePadding = 0;
        });

      foLabel
        .attr("width", function (d) { return d.width; })
        .attr("height", function (d) { return d.height; });

      textLabel = labelGroup
        .filter(function (d) { return d.label[0] !== "<"; });

      textLabel
        .select("text")
        .attr("text-anchor", "left")
        .append("tspan")
        .attr("dy", "1em")
        .text(function (d) { return d.label; });

      labelGroup
        .each(function (d) {
          var bbox = this.getBBox();
          d.bbox = bbox;
          if (d.label.length) {
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
        .attr("transform", function (d) {
          return "translate(" + d.dagre.x + "," + d.dagre.y + ")";
        })
        .selectAll("g.node rect")
        .attr("x", function (d) { return -(d.bbox.width / 2 + d.nodePadding); })
        .attr("y", function (d) { return -(d.bbox.height / 2 + d.nodePadding); })
        .attr("width", function (d) { return d.width; })
        .attr("height", function (d) { return d.height; });

      edges
        .selectAll("path")
        .attr("d", function (d) {
          var points, source, target;
          points = d.dagre.points.slice(0);
          source = dagre.util.intersectRect(d.source.dagre, points[0]);
          target = dagre.util.intersectRect(d.target.dagre, points[points.length - 1]);
          points.unshift(source);
          points.push(target);
          return d3.svg.line()
            .x(function (e) { return e.x; })
            .y(function (e) { return e.y; })
            .interpolate("linear")(points);
        });

      edges
        .selectAll("circle")
        .attr("r", 5)
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; });

      svgGroup
        .selectAll("g.label rect")
        .attr("x", function (d) { return -d.nodePadding; })
        .attr("y", function (d) { return -d.nodePadding; })
        .attr("width", function (d) { return d.width; })
        .attr("height", function (d) { return d.height; });

      nodes
        .selectAll("g.label")
        .attr("transform", function (d) {
          return "translate(" + (-d.bbox.width / 2) + "," + (-d.bbox.height / 2) + ")";
        });

      edges
        .selectAll("g.label")
        .attr("transform", function (d) {
          var points, x, y;
          points = d.dagre.points;
          x = (points[0].x + points[1].x) / 2;
          y = (points[0].y + points[1].y) / 2;
          return "translate(" + (-d.bbox.width / 2 + x) + "," + (-d.bbox.height / 2 + y) + ")";
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

      // TODO: Calculate max width of the tree, get the width of the
      // containerDiv, set containerDiv.width / treeWidth as max width of an
      // object in the tree.

      for (i in nodeObjects) {
        if (nodeObjects.hasOwnProperty(i)) {
          nodeObjects[i].id = nodeObjects[i].sha;
          // TODO: Allow class for div
          nodeObjects[i].label = '<div>' + nodeObjects[i].message + '</div>';
        }
      }

      // Replace source and target IDs in edgesArray with their actual objects.
      for (i = 0, len = edgesArray.length; i < len; i += 1) {
        if (!nodeObjects[edgesArray[i].source] || !nodeObjects[edgesArray[i].target]) {
          throw {
            name: 'GraphError',
            message: 'Source or target are not present in the current node set.'
          };
        }
        edgesArray[i].id = edgesArray[i].source + '-' + edgesArray[i].target;
        edgesArray[i].source = nodeObjects[edgesArray[i].source];
        edgesArray[i].target = nodeObjects[edgesArray[i].target];
        edgesArray[i].label = "";
      }
      // Translate nodeObjects into a d3 array.
      nodesArray = d3.values(nodeObjects);

      // Append the svg container to the given div.
      document.getElementById(spec.containerDivId).innerHTML = '\
        <svg width=1000 height=1000>\
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

      draw(nodesArray, edgesArray);
    };

    return that;
  };

  window[modulename] = constructor;
}('GPH'));