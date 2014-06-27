require.config({
  shim: {
    'jquery.modal': {
      deps: ['jquery'],
      exports: 'jQuery.fn.modal'
    }

  },

  // For development only.
  urlArgs: "bust=" + (new Date()).getTime()
});

requirejs(['mappiness.controller'],
function (mappiness_controller) {

  mappiness_controller().init();

});
