/**
 * For drawing the keys showing information about lines on the chart.
 * Includes the duplicate/edit/delete/show controls.
 * (Although their event listeners are in controller.
 */
define(['underscore'],
function(_) {
  return function() {
    var exports = {},
        // Can be set with exports.colorPool().
        colorPool = ['#f00', '#0f0', '#00f'],
        lines = [],
        templates = makeTemplates();

    /**
     * Displays the summaries/key for all the lines.
     */
    exports.update = function() {
      // Add keys.
      lines.forEach(function(line) {
        renderLineKey(line);
      });
      
      // Remove keys for any lines that no longer exist.
      var line_ids = lines.map(function(line) { return line.id; });
      $('.key-line').each(function(n, el) {
        var line_id = $(this).data('line-id');
        if (line_ids.indexOf(line_id) < 0) {
          removeLineKey(line_id);
        };
      });

      // If there's only one line left, remove the UI to delete it.
      if (lines.length == 1) {
        $('.key-delete').hide();
      } else {
        $('.key-delete').show();
      };

      // If we've got the maximum lines we're allowed, hide the duplicate
      // option.
      if (lines.length == colorPool.length) {
        $('.key-duplicate').hide();
      } else {
        $('.key-duplicate').show();
      };
    };


    /**
     * Remove the descriptive key for a line.
     */
    function removeLineKey(line_id) {
      $('#key-'+line_id).remove();
    };


    /**
     * Create the descriptive key for a line.
     * line is the data for that line.
     */
    function renderLineKey(line) {
      if ($('#key #key-'+line.id).length == 0) {
        // This line isn't listed, so make its empty HTML.
        $('#key').append(templates.line_key({
          line_id: line.id,
          line_color: line.color
        }));
      };

      // Needs to be in scope for AddToKey() and RemoveFromKey() to see it.
      // A bit nasty.
      var cssid = '#key-'+line.id;


      /**
       * Add an element to the current key, or update its contents if it exists.
       * content is an object containing:
       * clss: The class of the element(s) that will be added.
       * And one of:
       * title: Text to use for a title.
       * text: Text to use for this line.
       * rows: An array of objects with `description` and `value` elements.
       */
      var addToKey = function(content) {
        // Which template do we need?
        var template = templates.line_key_text;

        if ('title' in content) {
          template = templates.line_key_title;
        } else if ('rows' in content) {
          template = templates.line_key_rows; 
        };

        if ($('.key-descriptions .'+content.clss, cssid).length == 0) {
          // Element doesn't yet exist - create it.
          $('.key-descriptions', cssid).append( template(content) );
        } else {
          // Element exists, so just update its html.
          $('.key-descriptions .'+content.clss, cssid).html( template(content) );
        };
      };

      /**
       * Remove an element from the current key.
       * clss is the class name of the element to remove.
       */
      var removeFromKey = function(clss) {
        $('.key-descriptions .'+clss, cssid).remove();
      };

      var cons = line.constraints;

      $('h2', cssid).text(cons.feeling.description);

      if (('in_out' in cons && cons.in_out)
          || 
          ('home_work' in cons && cons.home_work)) {
          addToKey({clss: 'place', title: 'Place'});
      } else {
        removeFromKey('place')
      };
      if ('in_out' in cons && cons.in_out) {
        addToKey({clss: 'in-out', text: cons.in_out.description});
      } else {
        removeFromKey('in-out'); 
      };
      if ('home_work' in cons && cons.home_work) {
        addToKey({clss: 'home-work',text: cons.home_work.description});
      } else {
        removeFromKey('home-work');
      };

      if (_.keys(cons.people).length > 0) {
        addToKey({clss: 'people-title', title: 'People'});

        // How many possible people constraints are there?
        var total_people_constraints = _.keys(MAPPINESS_DATA_DICTIONARY.people).length;
        
        // How many of the constraints we have are 0?
        var num_zero_people_constraints = _.filter(
            _.values(cons.people), function(v){ return v.value == 0; }
          ).length;

        if (num_zero_people_constraints == total_people_constraints) {
          // ALL of the people constraints are set and they're ALL 0.
          // That means we've chosen 'Alone'.
          addToKey({
                clss: 'people',
                rows: [
                  // Fake a constraint:
                  {description: 'Alone, or with strangers only', value: 1}
                ]
              });
        } else {
          // SOME people constraints are set.
          addToKey({clss: 'people', rows: cons.people});
        };
      } else {
        removeFromKey('people-title');
        removeFromKey('people');
      };
    
      if (_.keys(cons.activities).length > 0) {
        addToKey({clss: 'activities-title', title: 'Activities'});
        addToKey({clss: 'activities', rows: cons.activities});
      } else {
        removeFromKey('activities-title');
        removeFromKey('activities');
      };

      if ('notes' in cons && cons.notes) {
        addToKey({clss: 'notes-title', title: 'Notes'});
        addToKey({clss: 'notes', text: 'Containing “'+cons.notes.description +'”'}); 
      } else {
        removeFromKey('notes-title');
        removeFromKey('notes');
      };
    };


    /**
     * Populates the templates object with compiled Underscore HTML templates.
     */
    function makeTemplates() {
      var templates = {};

      // The outline structure for a line's key.
      // Requires line_id and line_color.
      templates.line_key = _.template(' \
        <div id="key-<%= line_id %>" class="key-line" data-line-id="<%= line_id %>" style="border-top-color: <%= line_color %>;"> \
          <h2></h2> \
          <label class="key-switch"> \
            <input type="checkbox" class="key-switch-control" checked="checked" data-line-id="<%= line_id %>"> Show line \
          </label> \
          <a href="#" class="key-duplicate" data-line-id="<%= line_id %>">Duplicate</a> \
          <a href="#" class="key-edit" data-line-id="<%= line_id %>">Edit</a> \
          <a href="#" class="key-delete" data-line-id="<%= line_id %>">Delete</a> \
          <div class="key-descriptions"> \
          </div> \
        </div> \
      ');

      // Subtitle for a bit of the key.
      // Requires clss and title.
      templates.line_key_title = _.template(' \
        <h3 class="<%= clss %>"><%= title %></h3> \
      ');

      // A line of text in the key.
      // Requires clss and text.
      templates.line_key_text = _.template(' \
        <p class="<%= clss %>"><%= text %></p> \
      ');

      // One or more rows in the key.
      // Requires clss and a rows array.
      // Each element of rows is an object with description and value elements.
      templates.line_key_rows = _.template(' \
        <ul class="<%= clss %>"> \
          <% _.each(rows, function(row){ %> \
            <li> \
              <span><%= row.description %></span> \
              <span><% if (row.value == 1) { print("✓") } else if (row.value == 0) { print("✕") } else { print(row.value) } %></span> \
            </li> \
          <% }); %> \
        </ul> \
      ');

      return templates;
    };
    
    /* Getters/setters */

    exports.colorPool = function(val) {
      if (!arguments.length) return colorPool;
      colorPool = val;
      return this;
    };

    exports.lines = function(val) {
      if (!arguments.length) return lines;
      lines = val;
      return this;
    };

    return exports;
  };
});

