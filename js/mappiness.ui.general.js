define(['jquery', 'jquery.modal'],
function($,        jquery_modal) {
  return function() {
    var exports = {};

    exports.show

    exports.showImportForm = function() {
      exports.hideLoader(); 
      $('#importer').fadeIn(500);
    };

    exports.hideLoader = function() { 
      $('#loader').hide();
    };

    return exports;
  };
});
