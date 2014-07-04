/**
 * For handling all the dynamic forms etc.
 */
define(['d3', 'underscore', 'jquery.modal'],
function(d3,   _,            jquery_modal) {
  return function() {
    var exports = {},
        colorPool = ['#f00', '#0f0', '#00f'],
        // Will be an object containing textual descriptions of constraints.
        // Should be set by constraintsDescriptions();
        constraintsDescriptions = {},
        templates = makeTemplates(),
        lines;

    //d3.rebind(exports, dispatch, "on");


    /**
     * Displays the summaries/key for all the lines.
     */
    exports.updateKey = function(new_lines) {
      lines = new_lines;

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
      editFormPrepare(line_id);
      $('#line-edit').modal({
                          showClose: false,
                          clickClose: false
                      });
    };

    exports.editFormMakeConstraints = function() {
      var constraints = {};
      // TODO
    
      return constraints; 
    };


    /**
     * Prepares the edit form for a particular line.
     */
    editFormPrepare = function(line_id) {
      var line = _.find(lines, function(ln){ return ln.id == line_id; });
      if (line) {
        editFormInitialize();
        editFormSize();
        $('#line-edit-body').css('borderTopColor', line.color);
      } else {
        alert("Sorry, can't find the data for this line."); 
      };
    };

    /**
     * Adjust height of scrollable form body.
     */
    editFormSize = function() {
      $('#line-edit-body').height($('#line-edit').height() - $('#line-edit-buttons').outerHeight());
    };

    /**
     * Updates the contents of the edit form with all the correct inputs.
     * No form fields will be selected etc.
     */
    editFormInitialize = function() {
      $('.line-edit-col').empty();

      $('#line-edit-col-1').append(templates.line_edit_feelings({
        feelings: {happy: 'Happy', relaxed: 'Relaxed', awake: 'Awake'}
      }));
    
      $('#line-edit-col-1').append(templates.line_edit_people({
        people: constraintsDescriptions.people
      }));

      $('#line-edit-col-1').append(templates.line_edit_place({
        in_out: constraintsDescriptions.in_out,
        home_work: constraintsDescriptions.home_work
      }));
      
      $('#line-edit-col-1').append(templates.line_edit_notes());

      $('#line-edit-col-2').append(templates.line_edit_activities({
        activities: constraintsDescriptions.activities
      }));

      // Resizing...
      
      $(window).resize(function(){
        // Keep the edit window centered.
        $.modal.resize(); 
        editFormSize();
      });

      // Set up custom events when changing certain fields.
      
      $('#le-people').on('change', 'input[type=radio]', function(ev) {
        if ($(this).attr('id') == 'le-people-with') {
          $('#le-people-with-list').slideDown(); 
        } else {
          $('#le-people-with-list').slideUp(); 
          $('#le-people-with-list select').val('ignore')
                                        .next('label').addClass('text-muted');
        };
      });

      // Default state.
      $('.muted-labels label').addClass('text-muted');

      $('.muted-labels').on('change', 'select,input[type=radio]', function(ev) {
        if ($(this).attr('type') == 'radio') {
          $(this).siblings('input:radio').next('label').addClass('text-muted');
          $(this).next('label').removeClass('text-muted');
        
        } else {
          // select fields.
          if ($(this).val() == 'ignore') {
            $(this).closest('li').children('label').addClass('text-muted');
          } else {
            $(this).closest('li').children('label').removeClass('text-muted');
          };
        };
      });

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

      if (d3.keys(cons.people).length > 0) {
        addToKey({clss: 'people-title', title: 'People'});
        addToKey({clss: 'people', rows: cons.people});
      } else {
        removeFromKey('people-title');
        removeFromKey('people');
      };
    
      if (d3.keys(cons.activities).length > 0) {
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

      // Templates for the line key.

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
          <dl class="key-descriptions"> \
          </dl> \
        </div> \
      ');

      // Subtitle for a bit of the key.
      // Requires clss and title.
      templates.line_key_title = _.template(' \
        <dt class="<%= clss %>"><%= title %></dt> \
      ');

      // A line of text in the key.
      // Requires clss and text.
      templates.line_key_text = _.template(' \
        <dd class="<%= clss %>"><%= text %></dd> \
      ');

      // One or more rows in the key.
      // Requires clss and a rows array.
      // Each element of rows is an object with description and value elements.
      templates.line_key_rows = _.template(' \
        <% _.each(rows, function(row){ %> \
          <dd class="<%- clss %>"> \
            <span><%= row.description %></span> \
            <span><%= row.value %></span> \
          </dd> \
        <% }); %> \
      ')


      // Templates for the line edit form.

      templates.line_edit_feelings = _.template(' \
        <h3>Feelings</h3> \
        <p class="muted-labels"> \
          <% count = 1; %> \
          <% _.each(feelings, function(description, key) { %> \
            <input type="radio" name="feeling" id="le-feeling-<%= key %>" value="<%= key %>"<% if (key == "happy") { print(""); } %>> \
            <label for="le-feeling-<%= key %>"> \
              <%= description %> \
            </label> \
            <% if (count < _.keys(feelings).length) { print("<br>") } %> \
            <% count += 1; %> \
          <% }); %> \
        </p> \
        <hr> \
      ');

      templates.line_edit_people = _.template(' \
        <div id="le-people"> \
          <h3>People</h3> \
          <p class="muted-labels"> \
            <input type="radio" name="le-people" id="le-people-ignore" value="ignore"> \
            <label for="le-people-ignore"> \
              Any \
            </label> \
            <br> \
            <input type="radio" name="le-people" id="le-people-alone" value="alone"> \
            <label for="le-people-alone"> \
              Alone, or with strangers only \
            </label> \
            <br> \
            <input type="radio" name="le-people" id="le-people-with" value="with"> \
            <label for="le-people-with"> \
              With… \
            </label> \
          </p> \
          <ul id="le-people-with-list" class="list-unstyled muted-labels"> \
            <% _.each(people, function(description, key) { %> \
              <li> \
                <label class="le-select-label" for="le-people-<%= key %>"><%= description %></label> \
                <span class="le-select-field"> \
                  <select name="le-people-with" id="le-people-<%= key %>"> \
                    <option value="ignore">Ignore</option> \
                    <option value="yes">Yes</option> \
                    <option value="no">No</option> \
                  </select> \
                </span> \
              </li> \
            <% }); %> \
          </ul> \
        </div> \
        <hr> \
      ');

      templates.line_edit_place = _.template(' \
        <h3>Place</h3> \
        <p> \
          <select name="le-place-inout" id="le-place-inout"> \
            <option value="ignore"><%= _.values(in_out).join(" / ") %></option> \
            <% _.each(in_out, function(description, key) { %> \
              <option value="<%= key %>"><%= description %> only</option> \
            <% }); %> \
          </select> \
          <label for="le-place-inout" class="hide"><%= _.values(in_out).join(" / ") %></label> \
        </p> \
        <p> \
          <select name="le-place-homework" id="le-place-homework"> \
            <option value="ignore"><%= _.values(home_work).join(" / ") %></option> \
            <% _.each(home_work, function(description, key) { %> \
              <option value="<%= key %>"><%= description %> only</option> \
            <% }); %> \
          </select> \
          <label for="le-place-homework" class="hide"><%= _.values(home_work).join(" / ") %></label> \
        </p> \
        <hr> \
      ');

      templates.line_edit_notes = _.template(' \
        <h3><label for="le-notes">Notes containing:</label></h3> \
        <p> \
          <input type="text" name="le-notes" id="le-notes" value="" placeholder="Anything or nothing"> \
        </p> \
        <hr class="le-notes-hr"> \
      ');

      templates.line_edit_activities = _.template(' \
        <div id="le-activities"> \
          <h3>Activities</h3> \
          <div id="le-activities-list"> \
            <ul class="list-unstyled muted-labels"> \
              <% count = 1; %> \
              <% _.each(activities, function(description, key) { %> \
                <% if (key != "do_other2") { %> \
                  <li> \
                    <label class="le-select-label" for="le-activities-<%= key %>"><%= description %></label> \
                    <span class="le-select-field"> \
                      <select name="le-activities" id="le-activities-<%= key %>"> \
                        <option value="ignore">Ignore</option> \
                        <option value="yes">Yes</option> \
                        <option value="no">No</option> \
                      </select> \
                    </span> \
                  </li> \
                  <% if (count == Math.floor(_.keys(activities).length / 2)) { %> \
                    </ul> \
                    <ul class="list-unstyled muted-labels last"> \
                  <% } %> \
                <% } %> \
                <% count += 1; %> \
              <% }); %> \
            </ul> \
          </div> \
        </div> \
      ');

      templates.line_edit_buttons = _.template(' \
        <div id="le-buttons"> \
          <button type="button" class="btn btn-default">Cancel</button> \
          <button type="submit" class="btn btn-default">Submit</button> \
        </div> \
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
      editFormInitialize();
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


