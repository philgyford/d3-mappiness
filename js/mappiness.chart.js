/**
 * The top, main chart is referred to by `focus`.
 * The bottom, brush chart is referred to by `context`.
 */
define(['d3'],
function(d3) {
  var // Total width and height for both charts:
      width = 960,
      height = 350,
      margin = {top: 10, right: 10, bottom: 20, left: 30},

      focusMargin,
      focusWidth,
      focusHeight,
      contextMargin,
      contextWidth,
      contextHeight,

      // Elements that will be declared later:
      svg,
      focusG,
      focusAxesG,
      contextG,
      contextAxesG,
      brush,

      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },

      focusXScale = d3.time.scale(),
      contextXScale = d3.time.scale(),
      focusYScale = d3.scale.linear(),
      contextYScale = d3.scale.linear(),

      dateFormat = d3.time.format('%-d %b %Y'),
      ratingFormat = function(d) { return d * 100; },
      focusXAxis = d3.svg.axis()
                        .scale(focusXScale)
                        .orient('bottom'),
                        //.tickFormat(dateFormat),
                        //.ticks(d3.time.years, 5),
      contextXAxis = d3.svg.axis()
                        .scale(contextXScale)
                        .orient('bottom'),
      focusYAxis = d3.svg.axis()
                          .scale(focusYScale)
                          .orient('left')
                          .tickFormat(ratingFormat),
      contextYAxis = d3.svg.axis()
                          .scale(contextYScale)
                          .orient('left'),
      
      contextLine = d3.svg.line().x(X).y(contextY),
      focusLine = d3.svg.line().x(X).y(focusY),
      
      colorScale = d3.scale.ordinal()
                      .range(['#dc3a2d', '#2e5aa9', '#518d48', '#000', '#666']);

  function exports(_selection) {
    _selection.each(function(data) {

      // Select svg element if it exists.
      svg = d3.select(this)
                .selectAll('svg')
                  .data([data]);

      // Give each line its own color, keyed by its ID.
      // (The ID is stored in each point of the line.)
      colorScale.domain(data.map(function(d) { return d.values[0].id; } ));

      createMain();

      updateScales(data);

      renderAxes();
    
      renderLines('focus');

      renderBrush();
    });
  };


  function createMain() {
    setDimensions();

    // Create skeletal chart, with no data applied.
    focusG = svg.enter()
                  .append('svg')
                    .append('g')
                      .attr('class', 'focus');

    contextG = svg.append('g')
                      .attr('class', 'context');

    focusAxesG = focusG.append('g')
                      .attr('class', 'axes');

    contextAxesG = contextG.append('g')
                      .attr('class', 'axes');

    // If g.focus already exists, we need to explicitly select it:
    focusG = svg.select('g.focus');
    contextG = svg.select('g.context');

    // Update outer and inner dimensions.
    svg.transition().attr({ width: width, height: height });

    // When we add `clip-path:url(#clip)` to the lines in the main chart,
    // this stops them extending beyond the chart area.
    focusG.append('clipPath')
            .attr('id', 'clip')
            .append('rect')
              .attr('width', focusWidth)
              .attr('height', focusHeight);

    focusG.attr('transform',
                'translate(' + focusMargin.left +','+ focusMargin.top + ')');
    contextG.attr('transform',
              'translate(' + contextMargin.left +','+ contextMargin.top + ')');

  };


  function updateScales(data) {
    setDimensions();

    // Get min and max of all the start times for all the lines.
    focusXScale.domain([
      d3.min(data, function(line) {
        return d3.min(line.values, function(response) {
          return response.start_time;
        })
      }),
      d3.max(data, function(line) {
        return d3.max(line.values, function(response) {
          return response.start_time;
        })
      })
    ]).range([0, focusWidth]);

    contextXScale.domain(focusXScale.domain()).range([0, contextWidth]);

    focusYScale.domain([0, 1]).range([focusHeight, 0]);

    contextYScale.domain(focusYScale.domain()).range([contextHeight, 0]);
  };


  function setDimensions() {
    focusMargin = {top: margin.top, right: margin.right,
                      bottom: 100, left: margin.left};

    // Width and height of main, focus chart area, not including axes.
    focusWidth = width - focusMargin.left - focusMargin.right;
    focusHeight = height - focusMargin.top - focusMargin.bottom;

    contextMargin = {top: focusHeight + 40, right: focusMargin.right,
                      bottom: margin.bottom, left: focusMargin.left};

    // Width and height of small, context chart area, not including axes.
    contextWidth = width - contextMargin.left - contextMargin.right;
    contextHeight = height - contextMargin.top - contextMargin.bottom;
  };


  function renderAxes() {
    renderFocusXAxis();
    renderFocusYAxis();
    renderContextXAxis();
    renderFocusGrid();
  };


  function renderFocusXAxis() {
    focusAxesG.append('g')
            .attr('class', 'x axis');

    focusG.select('.x.axis')
            .attr('transform', 'translate(0,' + focusYScale.range()[0] + ')')
            .call(focusXAxis);
  };


  function renderFocusYAxis() {
    focusAxesG.append('g')
            .attr('class', 'y axis');
    focusG.select('.y.axis')
            .call(focusYAxis);
  };


  function renderContextXAxis() {
    contextAxesG.append('g')
            .attr('class', 'x axis');

    contextG.select('.x.axis')
            .attr('transform', 'translate(0,' + contextYScale.range()[0] + ')')
            .call(contextXAxis);
  };

  /**
   * Adds a horizontal line half way up the chart.
   */
  function renderFocusGrid() {
    focusAxesG.selectAll('path.line.grid')
                .data([[
                        [focusXScale.domain()[0], 0.5],
                        [focusXScale.domain()[1], 0.5]
                      ]])
                .enter().append('path')
                  .attr('class', 'line grid')
                  .attr('d', d3.svg.line()
                                    .x(function(d){return focusXScale(d[0]); })
                                    .y(function(d){return focusYScale(d[1]); })
                                  );
  };

  /**
   * Draw each of the lines, on either of the charts.
   * `chart` is either 'focus' or 'context'.
   */
  function renderLines(chart) {

    // Each chart has its own element that we draw in, and its own line object.
    if (chart == 'context') {
      var chartEl = contextG;
      var chartLine = contextLine;
    } else {
      var chartEl = focusG;
      var chartLine = focusLine;
    };

    var line = chartEl.selectAll('path.line.feeling')
                      .data(function(d) { return d; },
                            function(d) { return d.values[0].id; });

    line.enter().append('path')
          .attr('class', 'line feeling')
          .attr('id', function(d) { return lineCSSID(d.values[0].id, chart); })
          .style('stroke', function(d) { return colorScale(d.values[0].id); });

    line.data(function(d) { return d; })
        .transition()
        .attr('d', function(d) { return chartLine(d.values); });

    // Remove any currently-drawn lines that no longer exist in the data.
    line.exit().remove();
  };


  /**
   * Return the string used for a line's CSS ID.
   * id is the numeric ID of the line.
   * chart is 'context' or 'focus'.
   */
  function lineCSSID(id, chart) {
    return chart + '-' + id; 
  };

  /**
   * Most of the stuff for drawing the context/brush chart.
   */
  function renderBrush() {
    brush = d3.svg.brush().x(contextXScale)
                          .on('brush', brushed);
                        
    renderLines('context');

    contextG.append('g')
      .attr('class', 'x brush')
      .call(brush)
    .selectAll('rect')
      .attr('y', -6)
      .attr('height', contextHeight + 6);
  };

  function brushed() {
    focusXScale.domain(brush.empty() ? contextXScale.domain() : brush.extent());
    focusG.selectAll('path.line.feeling')
              .attr('d', function(d) { return focusLine(d.values); });
    focusG.select(".x.axis").call(focusXAxis);
  };


  function X(d) {
    return focusXScale(d.start_time);
  };

  function focusY(d) {
    return focusYScale(d.value);
  };
  function contextY(d) {
    return contextYScale(d.value);
  };

  /**
   * Make a line visible/invisible (in both context and focus charts).
   * line_id is the numeric ID of the line.
   */
  exports.toggleLine = function(line_id) {
    // Do it for each chart:
    ['context', 'focus'].forEach(function(chart) {
      var selector = 'path#' + lineCSSID(line_id, chart);

      if (d3.select(selector).style('opacity') == 0) {
        d3.select(selector).transition().style('opacity', 1);
      } else {
        d3.select(selector).transition().style('opacity', 0);
      };
    });
  };


  exports.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return this;
  };

  exports.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  exports.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  exports.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  exports.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  exports.getColorScale = function() {
    return colorScale; 
  };

  //d3.rebind(exports, dispatch, "on");

  return exports;

});

