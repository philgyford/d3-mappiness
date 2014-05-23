
var mappiness = {};

mappiness.dataManager = function module() {
  var exports = {},
      dispatch = d3.dispatch('dataReady', 'dataLoading'),
      data;

  exports.loadJSON = function(filepath) {
    var load = d3.json(filepath); 

    load.on('progress', function() { dispatch.dataLoading(d3.event.loaded); });

    load.get(function(error, response) {

      response.forEach(function(d) {
        cleanData(d);
      });

      data = response;

      dispatch.dataReady(response);
    });
  };

  exports.getCleanedData = function() {
    return data;
  };

  // Do any tidying up of the data we need.
  var cleanData = function(d) {
    // Change the string date/times into Date objects.
    d.beep_time = new Date(d.beep_time);
    d.start_time = new Date(d.start_time);
    return d;
  };

  d3.rebind(exports, dispatch, 'on');

  return exports;
};


/**
 * The top, main chart is referred to by `focus`.
 * The bottom, brush chart is referred to by `context`.
 */
mappiness.chart = function module() {
  var // Total width and height for both charts:
      width = 960,
      height = 500,
      margin = {top: 10, right: 10, bottom: 20, left: 25},

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
      focusXAxis = d3.svg.axis()
                        .scale(focusXScale)
                        .orient('bottom'),
                        //.tickFormat(dateFormat),
                        //.ticks(d3.time.years, 5),
      context_xAxis = d3.svg.axis()
                        .scale(contextXScale)
                        .orient('bottom'),
      focusYAxis = d3.svg.axis()
                          .scale(focusYScale)
                          .orient('left'),
      contextYAxis = d3.svg.axis()
                          .scale(contextYScale)
                          .orient('left'),
      lines = [
        {
          type: 'awake',
          context_line: d3.svg.line().x(X).y(focusYAwake),
          focus_line: d3.svg.line().x(X).y(contextfocusYAwake)
        },
        {
          type: 'relaxed',
          context_line: d3.svg.line().x(X).y(focusYRelaxed),
          focus_line: d3.svg.line().x(X).y(contextYRelaxed)
        },
        {
          type: 'happy',
          context_line: d3.svg.line().x(X).y(focusYHappy),
          focus_line: d3.svg.line().x(X).y(contextfocusYHappy)
        }
      ];

  function exports(_selection) {
    _selection.each(function(data) {

      // Select svg element if it exists.
      svg = d3.select(this)
                .selectAll('svg')
                  .data([data]);

      createMain();

      updateScales(data);

      renderAxes();
    
      renderBody();

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
    focusG= svg.select('g.focus');
    contextG= svg.select('g.context');

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

    focusXScale.domain([
      d3.min(data, function(response){
        return response.start_time;
      }),
      d3.max(data, function(response){
        return response.start_time;
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
    renderXAxis();
    renderYAxis();
    renderContextXAxis();
  };


  function renderXAxis() {
    focusAxesG.append('g')
            .attr('class', 'x axis');

    focusG.select('.x.axis')
            .attr('transform', 'translate(0,' + focusYScale.range()[0] + ')')
            .call(focusXAxis);
  };


  function renderYAxis() {
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
            .call(context_xAxis);
  };

  function renderBody() {
    var linesG = focusG.selectAll('g.lines')
                          .data(function(d) { return [d]; },
                                function(d) { return 'todo'; });

    linesG.enter().append('g')
                    .attr('class', 'lines');

    linesG.exit().remove();

    renderLines(linesG);
  };


  function renderLines(linesG) {

    // Each of lines has a type ('happy') and a line (a d3.svg.line object).
    lines.forEach(function(ln) {
        linesG.selectAll('path.line.'+ln.type)
            .data(function(d) { return [d]; }, function(d) { return ln.type; })
            .enter().append('path')
              .attr('class', 'line '+ln.type);

        linesG.selectAll('path.line.'+ln.type)
            .data(function(d) { return [d]; }, function(d) { return ln.type; })
            .transition()
            .attr('d', function(d) { return ln.context_line(d); });
      });
  };

  function renderBrush() {
    brush = d3.svg.brush()
                        .x(contextXScale)
                        .on('brush', brushed);
                        
    ////
    var linesG = contextG.selectAll('g.lines')
                          .data(function(d) { return [d]; },
                                function(d) { return 'todo'; });

    linesG.enter().append('g')
                    .attr('class', 'lines');

    linesG.exit().remove();

    ////
    lines.forEach(function(ln) {
        linesG.selectAll('path.line.'+ln.type)
            .data(function(d) { return [d]; }, function(d) { return ln.type; })
            .enter().append('path')
              .attr('class', 'line '+ln.type);

        linesG.selectAll('path.line.'+ln.type)
            .data(function(d) { return [d]; }, function(d) { return ln.type; })
            .transition()
            .attr('d', function(d) { return ln.focus_line(d); });
      });

    ////
    contextG.append('g')
      .attr('class', 'x brush')
      .call(brush)
    .selectAll('rect')
      .attr('y', -6)
      .attr('height', contextHeight + 7);
  };

  function brushed() {
    focusXScale.domain(brush.empty() ? contextXScale.domain() : brush.extent());
    lines.forEach(function(ln) {
      focusG.select('path.line.'+ln.type).attr('d', function(d) { return ln.context_line(d); });
    });
    focusG.select(".x.axis").call(focusXAxis);
  };

  function X(d) {
    return focusXScale(d.start_time);
  };

  function focusYHappy(d) {
    return focusYScale(d.happy);
  };
  function focusYRelaxed(d) {
    return focusYScale(d.relaxed);
  };
  function focusYAwake(d) {
    return focusYScale(d.awake);
  };
  function contextfocusYHappy(d) {
    return contextYScale(d.happy);
  };
  function contextYRelaxed(d) {
    return contextYScale(d.relaxed);
  };
  function contextfocusYAwake(d) {
    return contextYScale(d.awake);
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

  //d3.rebind(exports, dispatch, "on");

  return exports;

};


mappiness.controller = function module() {
  var exports = {},
      data,
      chart,
      dataManager = mappiness.dataManager();

  /**
   * Call this to kick things off.
   */
  exports.init = function() {
    
    dataManager.loadJSON('mappiness.json');

    dataManager.on('dataReady', function() {
      draw_chart(); 
    });
  };


  var draw_chart = function() {
    $('#wait').hide();
    $('#loaded').fadeIn(500);

    data = dataManager.getCleanedData();

    chart = mappiness.chart();

    var container = d3.select('#container')
                      .datum(data)
                      .call(chart);
  };

  return exports;
};


mappiness.controller().init();


