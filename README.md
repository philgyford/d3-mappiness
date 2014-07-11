# Mappiness d3 chart

*In progress.* Only tested in Chrome so far.

For charting data from the [Mappiness app](http://www.mappiness.org.uk/).

## Development

While developing, it's a pain to have to keep fetching your JSON data. So, download your raw data as a JSON file using your data download link from the app. 

Put your JSON file, named `mappiness.json`, in the same directory as this code (at the same level as `index.html`).

Put the code on a webserver (it won't run locally from a `file://` URL).

Load `index.html`.


## TO DO

* If you delete lines so that only one is left, but that line is set to not
  'Show', then it should be made to show.
* Add some dummy data for people to try it anyway. Generate on the fly?
* Fix scrollbar when loading remote data. CSS Loader?
* Hover over point, see its constraints.
* Add 'About' page/popup.
* Make keys wrap better.
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
