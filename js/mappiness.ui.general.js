define(['jquery', 'jquery.modal'],
function($,        jquery_modal) {
  return function() {
    var exports = {},
        // Will be a JS timeout object:
        loaderTimeout,
        importFormErrors = {
          generic: 'Sorry, something went wrong',
          // These keys are defined in mappiness.dataManager:
          bad_secret: "Mappiness didn't recognise your data code. Please check it.",
          ajax_error: "There was a problem while fetching your data. Maybe try again?"
        };

    exports.importFormShow = function() {
      exports.loaderHide(); 
      importFormErrorHide();
      $('#importer').fadeIn(500);
    };

    exports.importFormHide = function() { 
      $('#importer').hide();
    };

    exports.loaderShow = function() { 
      $('#loader').show();
      // If this starts taking a while, we show an extra message:
      loaderTimeout = setTimeout(function(){
        $('#loader-slow').fadeIn(1000); 
      }, 3000);
    };

    exports.loaderHide = function() { 
      clearTimeout(loaderTimeout);
      $('#loader-slow').hide();
      $('#loader').hide();
    };

    /**
     * There was an error related to the import form.
     * Show it and an error.
     */
    exports.importFormError = function(msgCode) {
      exports.importFormShow();
      importFormErrorShow(msgCode);
    };


    /**
     * The form should just have a secret code in it.
     * But we'll accept the whole URL and take the code from it too.
     * Returns the download code.
     * Or returns false if we couldn't extract one (and displays the error
     * message to the user).
     */
    exports.importFormProcess = function() {
      importFormErrorHide();
      // A url would be like 'https://mappiness.me/3kkq.pk7d.23wb'.
      var submitted_code = $('#importer-code').val();
      var code = submitted_code.match(/[a-z0-9]{4,4}\.[a-z0-9]{4,4}\.[a-z0-9]{4,4}/);
      if (code !== null) {
        $('#importer .text-error').hide();
        exports.importFormHide();
        exports.loaderShow();
        return code; 
      } else {
        $('#importer .text-error').show();
        return false;
      };
    };

    /**
     * The error at the top of the form.
     */
    function importFormErrorShow(msgCode) {
      exports.importFormShow();
      if ( ! msgCode in importFormErrors) {
        msgCode = 'generic';
      };
      $('#importer-error').html(importFormErrors[msgCode]).show();
    };

    /**
     * The error at the top of the form.
     */
    function importFormErrorHide() {
      $('#importer-error').hide();
    };

    return exports;
  };
});
