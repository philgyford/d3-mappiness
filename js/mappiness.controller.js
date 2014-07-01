/**
 */
define(['jquery', 'd3', './mappiness.chart', './mappiness.data_manager', './mappiness.ui'],
function($, d3, mappiness_chart, mappiness_dataManager, mappiness_ui) {
  return function(){
    var exports = {},
        container,
        data,
        chart,
        // Each element will correspond to one line on the chart, containing
        // all its data.
        lines_data = [],
        dataManager = mappiness_dataManager(),
        ui = mappiness_ui();

    /**
     * Call this to kick things off.
     */
    exports.init = function(spec) {

      if (spec) {
        if ('lineColors' in spec) {
          dataManager.colorPool(spec.lineColors);
          ui.colorPool(spec.lineColors);
        };
        if ('dataDictionary' in spec) {
           dataManager.constraintsDescriptions(spec.dataDictionary);
           ui.constraintsDescriptions(spec.dataDictionary);
        };
      };

      initListeners();

      dataManager.loadJSON('mappiness.json');

      dataManager.on('dataReady', function() {
        drawChart(); 
      });


      $('#line-edit').modal();

      
    };

    /**
     * Does the initial generating of the chart, once we've loaded all the
     * data.
     */
    function drawChart() {
      $('#wait').hide();
      $('#loaded').fadeIn(500);

      lines_data.push(dataManager.getCleanedData({feeling: 'happy', in_out: 'in', do_admin: 1, do_music: 0}));
      lines_data.push(dataManager.getCleanedData({feeling: 'awake', with_peers: 1}));
      lines_data.push(dataManager.getCleanedData({feeling: 'relaxed', notes: 'Pepys'}));

      chart = mappiness_chart().width( $('#chart').width() );

      container = d3.select('#chart');

      updateChart();
    };
    
    /**
     * Updates the chart and key with whatever is now in lines_data.
     */
    function updateChart() {
      container.data([lines_data])
               .call(chart);

      ui.updateKey(lines_data);
    };

    /**
     * Makes a copy of the line's data and adds it to the end of line_data.
     * Doesn't automatically update the chart or key displays.
     */
    function duplicateLine(line_id) {
      for (var n = 0; n < lines_data.length; n++) {
        if (lines_data[n].id == line_id) {
          // Make a new set of data using the original constraints passed into
          // the line we want to duplicate:
          var new_line = dataManager.getCleanedData(
                                            lines_data[n].original_constraints);
          // Originally wanted to add it just after the line that's being
          // duplicated, but that's madness and gets complicated.
          lines_data.push(new_line);
          break;
        };
      };
    };

    /**
     * Remove's the line's data from line_data.
     * Doesn't automatically update the chart or key displays.
     */
    function deleteLine(line_id) {
      for (var n = 0; n < lines_data.length; n++) {
        if (lines_data[n].id == line_id) {
          dataManager.releaseColor(lines_data[n].color);
          lines_data.splice(n, 1);
          break;
        };
      };
    };

    /**
     * Initialises all the various events we listen for in the UI.
     */
    function initListeners() {
      // The switches to turn each line on/off.
      $('#key').on('click', '.key-switch-control', function(ev) {
        chart.toggleLine($(this).data('line-id'));
      });

      $('#key').on('click', '.key-duplicate', function(ev) {
        ev.preventDefault();
        duplicateLine($(this).data('line-id'));
        updateChart();
      });

      $('#key').on('click', '.key-delete', function(ev) {
        ev.preventDefault();
        deleteLine($(this).data('line-id'));
        updateChart();
      });

      $('#key').on('click', '.key-edit', function(ev) {
        ev.preventDefault();
        ui.editFormOpen($(this).data('line-id'));
      });
    };

    return exports;
  };
});

