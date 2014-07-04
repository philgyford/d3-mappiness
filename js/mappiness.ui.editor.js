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
      prepare(line_id);
      $('#line-edit').modal({
                          showClose: false,
                          clickClose: false
                      });
    };

    exports.makeConstraints = function() {
      var constraints = {};
      // TODO
    
      return constraints; 
    };


    /**
     * Prepares the edit form for a particular line.
     */
    prepare = function(line_id) {
      var line = _.find(lines, function(ln){ return ln.id == line_id; });
      if (line) {
        initialize();
        resize();
        $('#line-edit-body').css('borderTopColor', line.color);
      } else {
        alert("Sorry, can't find the data for this line."); 
      };
    };


    /**
     * Adjust height of scrollable form body.
     */
    resize = function() {
      $('#line-edit-body').height($('#line-edit').height() - $('#line-edit-buttons').outerHeight());
    };

    /**
     * Updates the contents of the edit form with all the correct inputs.
     * No form fields will be selected etc.
     */
    initialize = function() {
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
        Resize();
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
     * Populates the templates object with compiled Underscore HTML templates.
     */
    function makeTemplates() {
      var templates = {};

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
    exports.constraintsDescriptions = function(val) {
      if (!arguments.length) return constraintsDescriptions;
      constraintsDescriptions = val;
      initialize();
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
