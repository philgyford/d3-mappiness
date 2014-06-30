/**
 * For handling all the dynamic forms etc.
 */
define(['d3', 'jquery.modal', 'underscore'],
function(d3, jquery_modal, _) {
  return function() {
    var exports = {},
        colorPool = ['#f00', '#0f0', '#00f'],
        // Will be an object containing textual descriptions of constraints.
        // Should be set by constraintsDescriptions();
        constraintsDescriptions = {},
        templates = makeTemplates();

    //d3.rebind(exports, dispatch, "on");


    /**
     * Displays the summaries/key for all the lines.
     */
    exports.updateKey = function(lines) {
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

    exports.editFormOpen = function(line_id) {
      $('#line-edit').modal({
        fadeDuration: 100
      });
    };

    /**
     * Updates the contents of the edit form with all the correct inputs.
     */
    editFormUpdate = function() {
      $('#line-edit-constraints').empty();

      $('#line-edit-constraints').append(templates.line_edit_feelings({
        feelings: ['happy', 'relaxed', 'awake']
      }));
    
      $('#line-edit-constraints').append(templates.line_edit_people({
        options: constraintsDescriptions.people
      }));
      
      //$('#line-edit-constraints').append(
        //$('<dt/>').text('People')
      //).append(
        //$('<dd/>').html('<label for="feeling-all"><input type="radio" name="feeling" id="feeling-all" value="all" checked="checked"> All</label>'
      //);
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
        $('#key').append(
          $('<div/>').attr('id', 'key-'+line.id)
                     .addClass('key-line')
                     .data('line-id', line.id)
                     .html('<h2></h2>'
                           + '<label class="key-switch"><input type="checkbox" class="key-switch-control" checked="checked"> Show line</label>'
                           + '<a href="#" class="key-duplicate">Duplicate</a> '
                           + '<a href="#" class="key-edit">Edit</a> '
                           + '<a href="#" class="key-delete">Delete</a>'
                           + '<dl class="key-descriptions"></dl>')
        );
      };

      var cssid = '#key-'+line.id;
      var cons = line.constraints;

      /**
       * Add an element to the current key, or update its contents if it exists.
       * el is like 'dt' or 'li'.
       * html is the HTML to put inside the element.
       * classes is a string of class names to give the element.
       */
      var addToKey = function(el, clss, html) {
        if ($('.key-descriptions .'+clss, cssid).length == 0) {
          // Element doesn't yet exist - create it.
          $('.key-descriptions', cssid).append(
            $('<'+el+'/>').html(html).addClass(clss)
          );
        } else {
          // Element exists, so just update its html.
          $('.key-descriptions .'+clss, cssid).html(html);
        };
      };

      /**
       * Remove an element from the current key.
       * clss is the class name of the element to remove.
       */
      var removeFromKey = function(clss) {
        $('.key-descriptions .'+clss, cssid).remove();
      };


      $(cssid).css('border-top-color', line.color);

      $('h2', cssid).text(cons.feeling.description);

      $('.key-switch-control', cssid).data('line-id', line.id);
      $('.key-duplicate', cssid).data('line-id', line.id);
      $('.key-delete', cssid).data('line-id', line.id);

      if (('in_out' in cons && cons.in_out)
          || 
          ('home_work' in cons && cons.home_work)) {
          addToKey('dt', 'place', 'Place');
      } else {
        removeFromKey('place')
      };
      if ('in_out' in cons && cons.in_out) {
        addToKey('dd', 'in-out', cons.in_out.description);
      } else {
        removeFromKey('in-out'); 
      };
      if ('home_work' in cons && cons.home_work) {
        addToKey('dd', 'home-work', cons.home_work.description);
      } else {
        removeFromKey('home-work');
      };

      if (d3.keys(cons.people).length > 0) {
        addToKey('dt', 'people-title', 'People');
        for (c in cons.people) {
          addToKey('dd', 'people',
                        '<span>' + cons.people[c].description + '</span>'
                      + '<span>' + cons.people[c].value + '</span>');
        };
      } else {
        removeFromKey('people-title');
        removeFromKey('people');
      };
    
      if (d3.keys(cons.activities).length > 0) {
        addToKey('dt', 'activities-title', 'Activities');
        for (c in cons.activities) {
          addToKey('dd', 'activities',
                        '<span>' + cons.activities[c].description + '</span>'
                      + '<span>' + cons.activities[c].value + '</span>');
        };
      } else {
        removeFromKey('activities-title');
        removeFromKey('activities');
      };

      if ('notes' in cons && cons.notes) {
        addToKey('dt', 'notes-title', 'Notes');
        addToKey('dd', 'notes', 'Include "'+cons.notes.description +'"'); 
      } else {
        removeFromKey('notes-title');
        removeFromKey('notes');
      };
    };

    /**
     * Handy.
     */
    function capitalizeFirstLetter(s) {
      return s.charAt(0).toUpperCase() + s.slice(1)
    };

    function makeTemplates() {
      var templates = {};

      templates.line_edit_feelings = _.template(' \
        <dt>Feelings</dt> \
        <dd> \
          <% _.each(feelings, function(feeling) { %> \
            <label for="le-feeling-happy"> \
              <input type="radio" name="feeling" id="le-feeling-<%= feeling %>" value="<%= feeling %>"> \
              <%= feeling.charAt(0).toUpperCase() + feeling.slice(1) %> \
            </label> \
          <% }); %> \
        </dd> \
      ');

      templates.line_edit_people = _.template(' \
        <dt>People</dt> \
        <dd> \
          <label for="le-people-alone-yes"> \
            <input type="radio" name="le-people-alone" id="le-people-alone-yes" value="yes"> \
            Alone, or with strangers only \
          </label> \
          <br> \
          <label for="le-people-alone-no"> \
            <input type="radio" name="le-people-alone" id="le-people-alone-no" value="no"> \
            Or with… \
          </label> \
          <ul> \
            <% _.each(options, function(description, key) { %> \
              <li> \
                <select name="le-people" id="le-people-<%= key %>"> \
                  <option value="any">Ignore</option> \
                  <option value="yes">Yes</option> \
                  <option value="no">No</option> \
                </select> \
                <label for="le-people-<%= key %>"><%= description %></label> \
              </li> \
            <% }); %> \
          </ul> \
        </dd> \
      ');

      return templates;
    };

    /**
     * Not only sets the constraintsDescriptions property, but also updates
     * the line edit form to use the new data.
     */
    exports.constraintsDescriptions = function(_) {
      if (!arguments.length) return constraintsDescriptions;
      constraintsDescriptions = _;
      editFormUpdate();
      return this;
    };

    exports.colorPool = function(_) {
      if (!arguments.length) return colorPool;
      colorPool = _;
      return this;
    };

    return exports;
  };
});


