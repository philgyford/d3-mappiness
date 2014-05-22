
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
  var margin = {top: 10, right: 10, bottom: 20, left: 25},
      width = 900,
      height = 350,
      inner_width = width - margin.left - margin.right,
      inner_height = height - margin.top - margin.bottom,
      svg,
      main_g,
      axes_g,
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      xScale = d3.time.scale(),
      yScale = d3.scale.linear(),
      dateFormat = d3.time.format('%-d %b %Y'),
      xAxis = d3.svg.axis()
                  .scale(xScale)
                  .orient('bottom'),
                  //.tickFormat(dateFormat),
                  //.ticks(d3.time.years, 5),
      yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient('left'),
      lines = [
        {type: 'happy',
         line: d3.svg.line().x(X).y(YHappy)},
        {type: 'relaxed',
         line: d3.svg.line().x(X).y(YRelaxed)},
        {type: 'awake',
         line: d3.svg.line().x(X).y(YRelaxed)}
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
    });
  };


  function createMain() {
    // Create skeletal chart, with no data applied.
    main_g = svg.enter()
                  .append('svg')
                    .append('g')
                      .attr('class', 'main');

    axes_g = main_g.append("g")
                      .attr("class", "axes");

    // If g.main already exists, we need to explicitly select it:
    main_g = svg.select('g.main');

    // Update outer and inner dimensions.
    svg.transition().attr({ width: width, height: height });
    main_g.attr('transform', 'translate(' + margin.left +','+ margin.top + ')');
  };


  function updateScales(data) {
    inner_width = width - margin.left - margin.right;
    inner_height = height - margin.top - margin.bottom;

    xScale.domain([
      d3.min(data, function(response){
        return response.start_time;
      }),
      d3.max(data, function(response){
        return response.start_time;
      })
    ]).range([0, inner_width]);

    yScale.domain([0, 1]).range([inner_height, 0]);
  };


  function renderAxes() {
    renderXAxis();
    renderYAxis();
  };


  function renderXAxis() {
    axes_g.append('g')
            .attr('class', 'x axis');

    main_g.select('.x.axis')
            .attr('transform', 'translate(0,' + yScale.range()[0] + ')')
            .call(xAxis);
  };


  function renderYAxis() {
    axes_g.append('g')
            .attr('class', 'y axis');
    main_g.select('.y.axis')
            .call(yAxis);
  };


  function renderBody() {
    var lines_g = main_g.selectAll('g.lines')
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
            .attr('d', function(d) { return ln.line(d); });
      });
  };

  function X(d) {
    return xScale(d.start_time);
  };

  function YHappy(d) {
    if (d.happy > 0.9) {
    console.log(d);
    }
    return yScale(d.happy);
  };
  function YRelaxed(d) {
    return yScale(d.relaxed);
  };
  function YAwake(d) {
    return yScale(d.awake);
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


