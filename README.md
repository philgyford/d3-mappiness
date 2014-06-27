# Mappiness d3 chart

In progress.

Download your data as JSON from the [Mappiness app](http://www.mappiness.org.uk/). 

Check out this code and run it on a webserver.

Put your Mappiness JSON file in the d3-mappiness directory with the checked-out files.

Load index.html in your browser.

## TO DO

* Load constraints_descriptions from JSON file in dataManager.
  (Need to ensure things don't progress until both that and the mappiness data
  have loaded.)
  Or do it in controller, and pass into both ui and dataManager?
* Either way, maybe on ui.init(), populate the #line-edit form with all the 
  blank fields for constraints.
* Then, when the edit field is opened, set the fields according to current
  line's properties.
* Update line's constraints and the chart when the form is submitted.


* Something that shows what dates are shown in focus area.
* Hover lines like on http://bl.ocks.org/gniemetz/4618602
* Rolling average. Configurable in UI?
* Points rather than dots? Gaps when there's no data?
* Filters:
	* Form for changing a line's filters.
	* Add map area filter?
* Demo site with dummy data.
* Permalinks?
* Remove require cache-busting in mappiness.js.
* Improve mappiness.dataManager's getNextColor() when colorPool runs out of colors.
