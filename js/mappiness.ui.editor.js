define(['underscore', 'jquery.modal'],
function(_,            jquery_modal) {
  return function() {
    var exports = {},
        // Will be an object containing textual descriptions of constraints.
        // Should be set by constraintsDescriptions();
        constraintsDescriptions = {},
        lines = [],
        templates = makeTemplates();

    /**
     * Open the editor for a particular line.
     */
    exports.open = function(line_id) {
      if (prepare(line_id)) {
        $('#line-edit').modal({
                            showClose: false,
                            clickClose: false
                        });
        
        // Occasionally it could re-open scrolled to the bottom, so:
        $('#line-edit-body').scrollTop(0);
      };
    };


    /**
     * When the form is submitted, go through the fields and create a new
     * set of constraints for this line and return them and the line id.
     */
    exports.processForm = function() {
      var constraints = {};

      constraints.feeling = $('input[name=le-feeling]:checked', '#line-edit').val();
      if ( ! constraints.feeling in ['happy', 'relaxed', 'awake']) {
        constraints.feeling = 'happy'; // Default.
      };

      // If the People radio button is 'Any', we do nothing here.
      var people_radio = $('input[name=le-people]:checked', '#line-edit').val();

      if (['alone', 'with'].indexOf(people_radio) >= 0) {
        // Go through all the possible responses...
        _.each(MAPPINESS_DATA_DICTIONARY.people, function(description, key) {
          if (people_radio == 'with') {
            // If the radio button is 'With...' then we record the constraint
            // for each option if it's 1 or 0.
            var value = parseInt($('#le-people-'+key).val());
            if ([1, 0].indexOf(value) >= 0) {
              constraints[key] = value; 
            };
          } else {
            // If the radio button is 'Alone, or with strangers only' then
            // we set ALL the people constraints to 0.
            constraints[key] = 0;
          };
        });
      };

      // Add in_out and home_work values if they're valid.
      
      var inout_value = $('#le-place-inout', '#line-edit').val(); 
      if (_.keys(MAPPINESS_DATA_DICTIONARY.in_out).indexOf(inout_value) >= 0) {
        constraints.in_out = inout_value; 
      };

      var homework_value = $('#le-place-homework', '#line-edit').val(); 
      if (_.keys(MAPPINESS_DATA_DICTIONARY.home_work).indexOf(homework_value) >= 0) {
        constraints.home_work = homework_value; 
      };

      // Add notes string if there is one.
      var notes_value = $('#le-notes', '#line-edit').val();
      if (notes_value !== '') {
        constraints.notes = notes_value; 
      };

      // Add any activities which aren't set to 'ignore'.
      _.each(MAPPINESS_DATA_DICTIONARY.activities, function(description, key) {
        var value = parseInt($('#le-activities-'+key).val());
        if ([1, 0].indexOf(value) >= 0) {
          constraints[key] = value; 
        };
      });

      return {
        constraints: constraints,
        lineID: parseInt($('#le-line-id', '#line-edit').val()),
        color: $('#le-color', '#line-edit').val()
      };
    };


    /**
     * Prepares the edit form for a particular line.
     */
    function prepare(line_id) {
      var line = _.find(lines, function(ln){ return ln.id == line_id; });
      if (line) {
        setupForLine(line);
        return true;
      } else {
        alert("Sorry, can't find the data for this line."); 
        return false;
      };
    };


    /**
     * Adjust height of scrollable form body.
     */
    function resize() {
      $('#line-edit-body').height(
            $('#line-edit').height() - $('#line-edit-buttons').outerHeight()
          );
    };


    /**
     * Updates the contents of the edit form with all the correct inputs.
     * No form fields will be selected etc.
     */
    function initialize() {
      $('.line-edit-col').empty();

      $('#line-edit-col-1').append(templates.line_edit_hidden({ }));

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
        resize();
      });

      // Set up custom events when changing certain fields.

      // Show the With... constraints when selecting that People radio button.
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

      // Make the label of checked radio buttons, or selected selects
      // change color.
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
     * Creates a new form for a particular line and its constraints.
     * line is a d3 line object.
     */
    function setupForLine(line) {
      // Clear any old settings.
      initialize();

      var c = line.constraints;

      $('#le-line-id').val(line.id);
      $('#le-color').val(line.color);

      if ('feeling' in c) {
        $('#le-feeling-'+c.feeling.value).prop('checked', true).change(); 
      };

      if ('people' in c) {
        // How many possible people constraints are there?
        var total_people_constraints = _.keys(MAPPINESS_DATA_DICTIONARY.people).length;

        // How many of the constraints we have are 0?
        var num_zero_people_constraints = _.filter(
            _.values(c.people), function(v){ return v.value == 0; }
          ).length;

        if (num_zero_people_constraints == total_people_constraints) {
          // ALL of the people constraints are set and they're ALL 0.
          // That means we've chosen 'Alone'.
          $('#le-people-alone').prop('checked', true).change();
        
        } else {
          // SOME people constraints are set.
          $('#le-people-with').prop('checked', true).change();

          _.each(c.people, function(constraint, name) {
            $('#le-people-'+name).val(constraint.value.toString()).change();
          });
        };
      
      } else {
        // No people constraints are set, either 1 or 0, at all.
        $('#le-people-ignore').prop('checked', true).change();
      };

      if ('in_out' in c) {
        $('#le-place-inout').val(c.in_out.value).change(); 
      };

      if ('home_work' in c) {
        $('#le-place-homework').val(c.home_work.value).change(); 
      };

      if ('notes' in c) {
        $('#le-notes').val(c.notes.value).change();
      };

      if ('activities' in c) {
        _.each(c.activities, function(constraint, name) {
          $('#le-activities-'+name).val(constraint.value.toString()).change();
        });
      };

      $('#line-edit-buttons').css('borderTopColor', line.color);
    };

    /**
     * Populates the templates object with compiled Underscore HTML templates.
     */
    function makeTemplates() {
      var templates = {};

      templates.line_edit_hidden = _.template(' \
        <div> \
          <input type="hidden" id="le-line-id" value=""> \
          <input type="hidden" id="le-color" value=""> \
        </div> \
      ');

      templates.line_edit_feelings = _.template(' \
        <h3>Feelings</h3> \
        <p class="muted-labels"> \
          <% count = 1; %> \
          <% _.each(feelings, function(description, key) { %> \
            <input type="radio" name="le-feeling" id="le-feeling-<%= key %>" value="<%= key %>"<% if (key == "happy") { print(""); } %>> \
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
                  <select name="le-people-<%= key %>" id="le-people-<%= key %>"> \
                    <option value="ignore">✓ or ✕</option> \
                    <option value="1">✓</option> \
                    <option value="0">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✕</option> \
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
          <input type="text" name="le-notes" id="le-notes" value="" placeholder=""> \
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
                        <option value="ignore">✓ or ✕</option> \
                        <option value="1">✓</option> \
                        <option value="0">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✕</option> \
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

    /* Getters/setters */

    exports.constraintsDescriptions = function(val) {
      if (!arguments.length) return constraintsDescriptions;
      constraintsDescriptions = val;
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
