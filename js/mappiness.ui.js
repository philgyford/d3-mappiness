/**
 * For handling all the dynamic forms etc.
 */
define(['./mappiness.ui.key', './mappiness.ui.editor'],
function(  mappiness_ui_key,     mappiness_ui_editor) {
  return function() {
    var exports = {};

    //d3.rebind(exports, dispatch, "on");

    exports.key = mappiness_ui_key();
    exports.editor = mappiness_ui_editor();

    /**
     * When the lines on the chart change, we need to reflect that in the UI.
     * lines is an array of d3 line objects.
     */
    exports.updateLines = function(lines) {
      exports.key.lines(lines);
      exports.key.updateKey();
      exports.editor.lines(lines);
    };

    return exports;
  };
});


