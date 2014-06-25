require.config({
  // For development only.
  urlArgs: "bust=" + (new Date()).getTime()
});

requirejs(['mappiness.controller'],
function (mappiness_controller) {

  mappiness_controller().init();

});
