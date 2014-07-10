# Mappiness d3 chart

*In progress.* Only tested in Chrome so far.

Download your data as JSON from the [Mappiness app](http://www.mappiness.org.uk/). 

Check out this code and put your Mappiness JSON file with it (at the same level
as `index.html`).

Put the code on a webserver (it won't run locally from a `file://` URL).

Load `index.html` in your browser and click "Edit"...


## TO DO

* Allow user to enter their secret code to use their data, a la
  http://blog.mappiness.org.uk/2011/05/23/api-guide/
  * Genericise modal use so we can...
  * If local file isn't there, open a pop-up form for user to enter their code.
  * Then fetch remote file.
  * Add some dummy data for people to try it anyway. Generate on the fly?
* Hover over point, see its constraints.
* Add 'About' page/popup.
* Something that shows what dates are shown in focus area.
* Remove require cache-busting in mappiness.js.
* Maybe:
  * Hover lines like on http://bl.ocks.org/gniemetz/4618602
  * Moving average. Configurable in UI?
  * Points rather than dots? Gaps when there's no data?
  * Add map area filter?
  * Permalinks?


## For writeup

* So much of the work is in getting the data in the right format (even when the source data is already decent), the interactions, the HTML/CSS/JS in the UI (not the chart).
* Ease of putting the brush in, vs difficulty of tweaking edge cases (adding/removing lines to chart which change the domain, ensuring the brush doesn't end up off the edge, etc).
* Balancing doing things "the right way" with "good enough". eg, JS templates would be nice, but it added either 40KB+ to page load, and further slowness to compile on the front end, or another dependency to compile the templates on the command line.
* All the edge cases. Hiding/showing things on the key, the brush, lines when constraints mean there are no data, etc.
