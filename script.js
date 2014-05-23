
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


mappiness.chart = function module() {
  var // Total width and height for both charts:
      width = 960,
      height = 500,

      focus_margin = {top: 10, right: 10, bottom: 100, left: 25},
      focus_width = width - focus_margin.left - focus_margin.right,
      focus_height = height - focus_margin.top - focus_margin.bottom,

      context_margin = {top: 430, right: 10, bottom: 20, left: 25},
      context_height = height - context_margin.top - context_margin.bottom,
      context_width = width - context_margin.left - context_margin.right,

      svg,
      focus_g,
      focus_axes_g,
      context_g,
      context_axes_g,
      brush,

      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },

      focus_xScale = d3.time.scale(),
      context_xScale = d3.time.scale(),
      focus_yScale = d3.scale.linear(),
      context_yScale = d3.scale.linear(),

      dateFormat = d3.time.format('%-d %b %Y'),
      focus_xAxis = d3.svg.axis()
                        .scale(focus_xScale)
                        .orient('bottom'),
                        //.tickFormat(dateFormat),
                        //.ticks(d3.time.years, 5),
      context_xAxis = d3.svg.axis()
                        .scale(context_xScale)
                        .orient('bottom'),
      focus_yAxis = d3.svg.axis()
                          .scale(focus_yScale)
                          .orient('left'),
      context_yAxis = d3.svg.axis()
                          .scale(context_yScale)
                          .orient('left'),
      lines = [
        {
          type: 'awake',
          context_line: d3.svg.line().x(X).y(YAwake),
          focus_line: d3.svg.line().x(X).y(context_YAwake)
        },
        {
          type: 'relaxed',
          context_line: d3.svg.line().x(X).y(YRelaxed),
          focus_line: d3.svg.line().x(X).y(context_YRelaxed)
        },
        {
          type: 'happy',
          context_line: d3.svg.line().x(X).y(YHappy),
          focus_line: d3.svg.line().x(X).y(context_YHappy)
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
    // Create skeletal chart, with no data applied.
    focus_g = svg.enter()
                  .append('svg')
                    .append('g')
                      .attr('class', 'focus');

    context_g = svg.append('g')
                      .attr('class', 'context');

    focus_axes_g = focus_g.append('g')
                      .attr('class', 'axes');

    context_axes_g = context_g.append('g')
                      .attr('class', 'axes');

    // If g.focus already exists, we need to explicitly select it:
    focus_g= svg.select('g.focus');
    context_g= svg.select('g.context');

    // Update outer and inner dimensions.
    svg.transition().attr({ width: width, height: height });

    // When we add `clip-path:url(#clip)` to the lines in the main chart,
    // this stops them extending beyond the chart area.
    focus_g.append('clipPath')
            .attr('id', 'clip')
            .append('rect')
              .attr('width', focus_width)
              .attr('height', focus_height);

    focus_g.attr('transform', 'translate(' + focus_margin.left +','+ focus_margin.top + ')');
    context_g.attr('transform', 'translate(' + context_margin.left +','+ context_margin.top + ')');
  };


  function updateScales(data) {
    focus_width = width - focus_margin.left - focus_margin.right;
    focus_height = height - focus_margin.top - focus_margin.bottom;

    focus_xScale.domain([
      d3.min(data, function(response){
        return response.start_time;
      }),
      d3.max(data, function(response){
        return response.start_time;
      })
    ]).range([0, focus_width]);
    context_xScale.domain(focus_xScale.domain()).range([0, context_width]);

    focus_yScale.domain([0, 1]).range([focus_height, 0]);

    context_yScale.domain(focus_yScale.domain()).range([context_height, 0]);
  };


  function renderAxes() {
    renderXAxis();
    renderYAxis();
    renderContextXAxis();
  };


  function renderXAxis() {
    focus_axes_g.append('g')
            .attr('class', 'x axis');

    focus_g.select('.x.axis')
            .attr('transform', 'translate(0,' + focus_yScale.range()[0] + ')')
            .call(focus_xAxis);
  };


  function renderYAxis() {
    focus_axes_g.append('g')
            .attr('class', 'y axis');
    focus_g.select('.y.axis')
            .call(focus_yAxis);
  };

  function renderContextXAxis() {
    context_axes_g.append('g')
            .attr('class', 'x axis');

    context_g.select('.x.axis')
            .attr('transform', 'translate(0,' + context_yScale.range()[0] + ')')
            .call(context_xAxis);
  };

  function renderBody() {
    var lines_g = focus_g.selectAll('g.lines')
                          .data(function(d) { return [d]; },
                                function(d) { return 'todo'; });

    lines_g.enter().append('g')
                    .attr('class', 'lines');

    lines_g.exit().remove();

    renderLines(lines_g);
  };


  function renderLines(lines_g) {

    // Each of lines has a type ('happy') and a line (a d3.svg.line object).
    lines.forEach(function(ln) {
        lines_g.selectAll('path.line.'+ln.type)
            .data(function(d) { return [d]; }, function(d) { return ln.type; })
            .enter().append('path')
              .attr('class', 'line '+ln.type);

        lines_g.selectAll('path.line.'+ln.type)
            .data(function(d) { return [d]; }, function(d) { return ln.type; })
            .transition()
            .attr('d', function(d) { return ln.context_line(d); });
      });
  };

  function renderBrush() {
    brush = d3.svg.brush()
                        .x(context_xScale)
                        .on('brush', brushed);
                        
    ////
    var lines_g = context_g.selectAll('g.lines')
                          .data(function(d) { return [d]; },
                                function(d) { return 'todo'; });

    lines_g.enter().append('g')
                    .attr('class', 'lines');

    lines_g.exit().remove();

    ////
    lines.forEach(function(ln) {
        lines_g.selectAll('path.line.'+ln.type)
            .data(function(d) { return [d]; }, function(d) { return ln.type; })
            .enter().append('path')
              .attr('class', 'line '+ln.type);

        lines_g.selectAll('path.line.'+ln.type)
            .data(function(d) { return [d]; }, function(d) { return ln.type; })
            .transition()
            .attr('d', function(d) { return ln.focus_line(d); });
      });

    ////
    context_g.append('g')
      .attr('class', 'x brush')
      .call(brush)
    .selectAll('rect')
      .attr('y', -6)
      .attr('height', context_height + 7);
  };

  function brushed() {
    focus_xScale.domain(brush.empty() ? context_xScale.domain() : brush.extent());
    lines.forEach(function(ln) {
      focus_g.select('path.line.'+ln.type).attr('d', function(d) { return ln.context_line(d); });
    });
    focus_g.select(".x.axis").call(focus_xAxis);
  };

  function X(d) {
    return focus_xScale(d.start_time);
  };

  function YHappy(d) {
    return focus_yScale(d.happy);
  };
  function YRelaxed(d) {
    return focus_yScale(d.relaxed);
  };
  function YAwake(d) {
    return focus_yScale(d.awake);
  };
  function context_YHappy(d) {
    return context_yScale(d.happy);
  };
  function context_YRelaxed(d) {
    return context_yScale(d.relaxed);
  };
  function context_YAwake(d) {
    return context_yScale(d.awake);
  };

  exports.margin = function(_) {
    if (!arguments.length) return focus_margin;
    focus_margin = _;
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


