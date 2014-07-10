define(['jquery', 'jquery.modal'],
function($,        jquery_modal) {
  return function() {
    var exports = {},
        loaderTimeout;

    exports.show

    exports.showImportForm = function() {
      exports.hideLoader(); 
      $('#importer').fadeIn(500);
    };

    exports.hideImportForm = function() { 
      $('#importer').hide();
    };

    exports.showLoader = function() { 
      $('#loader').show();
      // If this starts taking a while, we show an extra message:
      loaderTimeout = setTimeout(function(){
        $('#loader-slow').fadeIn(1000); 
      }, 3000);
    };

    exports.hideLoader = function() { 
      clearTimeout(loaderTimeout);
      $('#loader-slow').hide();
      $('#loader').hide();
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
        exports.hideImportForm();
        exports.showLoader();
        return code; 
      } else {
        $('#importer .text-error').show();
        return false;
      };
    };

    return exports;
  };
});
