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
          ui.key.colorPool(spec.lineColors);
        };
        if ('dataDictionary' in spec) {
           dataManager.constraintsDescriptions(spec.dataDictionary);
           ui.editor.constraintsDescriptions(spec.dataDictionary);
        };
      };

      initListeners();

      var json = getJSON();

      dataManager.on('dataReady', function() {
        drawChart(); 
      });

    };

    /**
     * Gets the Mappiness JSON data and passes it to dataManager.
     * If there is a local `mappiness.json` file, we use that.
     * Otherwise, we fetch the remote one.
     */
    function getJSON() {
      $.ajax({
        url: 'mappiness.json',
        type: 'HEAD'
      })
      .fail(function() {
        ui.general.showImportForm();
      })
      .done(function() {
        dataManager.loadJSON('mappiness.json');
      });
    };


    /**
     * Does the initial generating of the chart, once we've loaded all the
     * data.
     */
    function drawChart() {
      ui.general.hideLoader();
      ui.general.hideImportForm();
      $('#loaded').fadeIn(500);

      // Add one line to kick things off:
      lines_data.push(dataManager.getCleanedData({feeling: 'happy'}));

      // Could add other starter lines too, eg:
      //lines_data.push(dataManager.getCleanedData({feeling: 'awake',
      //                in_out: 'in', home_work: 'home', with_children: 1}));

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

      ui.updateLines(lines_data);
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
     * Will replace a line in lines_data with a new set of data.
     * Matched using the lines' IDs.
     */
    function replaceLine(newLineData) {
      for (var n in lines_data) {
        if (lines_data[n].id == newLineData.id) {
          lines_data[n] = newLineData;
          break;
        };
      };
    };


    /**
     * Initialises all the various events we listen for in the UI.
     */
    function initListeners() {

      // Import form.

      $('#importer').on('submit', function(ev) {
        ev.preventDefault();
        var downloadCode = ui.general.processImportForm();
        if (downloadCode !== false) {
          dataManager.loadJSONP('https://mappiness.me/' + downloadCode + '/mappiness.json') 
        };
      });

      // Key.

      // The switches to turn each line on/off.
      $('#key').on('click', '.key-show-control', function(ev) {
        chart.toggleLine($(this).data('line-id'));
      });

      $('#key').on('click', '.key-duplicate-control', function(ev) {
        ev.preventDefault();
        duplicateLine($(this).data('line-id'));
        updateChart();
      });

      $('#key').on('click', '.key-delete-control', function(ev) {
        ev.preventDefault();
        deleteLine($(this).data('line-id'));
        updateChart();
      });

      $('#key').on('click', '.key-edit-control', function(ev) {
        ev.preventDefault();
        ui.editor.open($(this).data('line-id'));
      });
      
      // Edit form button events.
      
      $('#line-edit-buttons .button-cancel').on('click', function(ev) {
        ev.preventDefault();
        $.modal.close();
      });

      $('#line-edit').on('submit', function(ev) {
        ev.preventDefault();
        var formData = ui.editor.processForm();
        var newLineData = dataManager.getCleanedData(
                                formData.constraints,
                                {id: formData.lineID, color: formData.color});

        $.modal.close();

        replaceLine(newLineData);

        updateChart();
      });

    };

    return exports;
  };
});

