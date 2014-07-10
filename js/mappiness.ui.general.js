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

    exports.hideImportForm = function() { 
      $('#importer').hide();
    };

    /**
     * Returns the download code extracted from the url in the form.
     * Or returns false if we couldn't extract one (and displays the error
     * message to the user).
     */
    exports.processImportForm = function() {
      // url will hopefully be like 'https://mappiness.me/3kkq.pk7d.23wb'.
      var url = $('#importer-url').val();
      var code = url.match(/[a-z0-9]{4,4}\.[a-z0-9]{4,4}\.[a-z0-9]{4,4}/);
      if (code !== null) {
        $('#importer .text-error').hide();
        return code; 
      } else {
        $('#importer .text-error').show();
        return false;
      };
    };

    return exports;
  };
});
