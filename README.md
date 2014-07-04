# Mappiness d3 chart

In progress.

Download your data as JSON from the [Mappiness app](http://www.mappiness.org.uk/). 

Check out this code and run it on a webserver.

Put your Mappiness JSON file in the d3-mappiness directory with the checked-out files.

Load index.html in your browser.

## TO DO

* Line edit form
  * Update line's constraints and the chart when the form is submitted.
  * NOTE: With people constraints, if 'Alone' is checked, set ALL possible
    people constraints to 0.
* Hover over point, see its constraints.
* Something that shows what dates are shown in focus area.
* Demo site with dummy data.
* Remove require cache-busting in mappiness.js.

* Maybe:
  * Hover lines like on http://bl.ocks.org/gniemetz/4618602
  * Rolling average. Configurable in UI?
  * Points rather than dots? Gaps when there's no data?
  * Add map area filter?
  * Permalinks?


## For writeup

* So much of the work is in getting the data in the right format (even when the source data is already decent), the interactions, the HTML/CSS/JS in the UI (not the chart).
* Ease of putting the brush in, vs difficulty of tweaking edge cases (adding/removing lines to chart which change the domain, ensuring the brush doesn't end up off the edge, etc).
* Balancing doing things "the right way" with "good enough". eg, JS templates would be nice, but it added either 40KB+ to page load, and further slowness to compile on the front end, or another dependency to compile the templates on the command line.
*
