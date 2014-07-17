/*
 *
 * NOTE: Doesn't generate ALL of the data found in Mappiness's JSON.
 * Only the fields that the rest of the code needs.
 *
 * Arrays of activities and people that won't be used.
 * Each point value is based on the previous:
 *  * Randomly, will this be a big, med or small jump? Different chances.
 *  * +/- a random value depending on big/med/small.
 *  * Somehow decreasingly likely to reach close to the max/min values.
 * Have n periods when the user will be extra happy/sad, when values will get
 *   positive/negative boosts. Maybe these could have different locations?
 * Weighting for Awake value, depending on time of day.
 */
define(['d3'],
function(d3) {
  return function() {
    var exports = {},
        // How far back from today do we generate responses for?
        days = 20,
        responsesPerDay = 2,
        // We'll only generate responses between these hours:
        startHour = 8,
        // Must be higher than startHour. Because.
        endHour = 22;


    /**
     * Returns an array of objects simulating the JSON returned by Mappiness'
     * API.
     */
    exports.getJSON = function() {
      var endDate = new Date();
      // Get the date `days` ago.
      var startDate = new Date(new Date().setDate(endDate.getDate() - days));
      var json = [];
    
      // For every day between startDate and endDate:
      for (var d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
        var hours = [];
        while (hours.length < responsesPerDay) {
          // Random hour between startHour and endHour.
          var hour = Math.floor(Math.random() * ((endHour+1) - startHour) + startHour);
          // Ensure we don't have duplicate hours per day.
          if (hours.indexOf(hour) < 0) {
            hours.push(hour);
          };
        };
        hours = hours.sort(function(a, b){ return a - b; });
        // Get one response for each of the hours we need for this day.
        for (var n = 0; n < hours.length; n++) {
          d.setHours(hours[n]);
          json.push(generateResponse(d, json[json.length-1]));
        };
      };

      return json;
    };

    /**
     * Creates a single response object and returns it.
     * `d` is a Date object.
     * previousResopnse is, if present, the response object generated
     * previously.
     */
     function generateResponse(d, previousResponse) {
      var response = {
        beep_time_epoch: d.getTime(),
        beep_time: formatDate(d),
        start_time_epoch: d.getTime(),
        start_time: formatDate(d)
      };
    
      var place = generatePlace(d);
      response.in_out = place.in_out;
      response.home_work = place.home_work;

      var people = generatePeople(d, place);
      for (p in people) {
        response[p] = people[p];
      };

      var activities = generateActivities(d, response);
      for (a in activities) {
        response[a] = activities[a];
      };
      // Feelings


      if (previousResponse === undefined) {
        
      } else {
      
      };

      console.log(response);
      return response;
    };


    /**
     * Generates the in_out and home_work aspects of a response.
     * `d` is a Date object.
     * Returns an object with in_out and home_work keys.
     */
    function generatePlace(d) {
      var in_out,
          home_work;

      if (isWorkingHours(d)) {
        // At work, maybe.
        var chance = Math.random();
        if (chance < 0.8) {
          home_work = 'work'; 
        } else if (chance < 0.9) {
          home_work = 'home';
        } else {
          home_work = 'other';
        };
      } else if (isWeekend(d)) {
        if (Math.random() < 0.6) {
          home_work = 'home';
        } else {
          home_work = 'other';
        };
      } else {
        // Weekday, outside work hours.
        if (Math.random() < 0.7) {
          home_work = 'home';
        } else {
          home_work = 'other';
        };
      };

      if (isSleepTime(d)) {
        // You should be in bed! No camping apparently.
        in_out = 'in';

      } else if (home_work == 'home') {
        if (Math.random() < 0.8) {
          // If you're at home, you're most likely indoors?
          in_out = 'in'; 
        } else {
          in_out = 'out'; 
        };

      } else if (home_work == 'work') {
        if (Math.random() < 0.9) {
          in_out = 'in';
        } else {
          in_out = 'out'; 
        };

      } else { // 'other'.
        var chance = Math.random();
        if (chance < 0.3) {
          in_out = 'vehicle';
        } else if (chance < 0.6) {
          in_out = 'in';
        } else {
          in_out = 'out'; 
        };
      };

      return {
        in_out: in_out,
        home_work: home_work
      };
    };

    /**
     * Generates all the 1/0 values for people for a response.
     * `place` is the results of generatePlace(), an object with in_out and
     * home_work keys.
     * Returns an object with keys like `with_peers`, `with_partner` etc and
     * values of 1 or 0.
     */
    function generatePeople(d, place) {
      var people = {};

      // Set the default of 0 for everything first:
      for (p in MAPPINESS_DATA_DICTIONARY.people) {
        people[p] = 0;
      };

      if (Math.random() < 0.9) {
        // Because all the below will usually result in being with people, give
        // an overall chance of just not being with anyone.

        if (place.home_work == 'work' ||
            (place.home_work == 'other' && isWorkingHours(d))) {
          if (Math.random() < 0.9) {
            people.with_peers = 1;
          };
          if (Math.random() < 0.2) {
            people.with_clients = 1;
          };
          if (Math.random() < 0.1) {
            people.with_others = 1;
          };
        
        } else if (place.home_work == 'home') {
          if (Math.random() < 0.6) {
            people.with_partner = 1;
          };
          if (Math.random() < 0.6) {
            people.with_children = 1;
          };
          if (Math.random() < 0.2) {
            people.with_relatives = 1;
          };
          if (Math.random() < 0.1) {
            people.with_friends = 1;
          };
          if (Math.random() < 0.1) {
            people.with_others = 1;
          };

        } else { // home_work == 'other', but not working hours.
          if (Math.random() < 0.4) {
            people.with_partner = 1;
          };
          if (Math.random() < 0.4) {
            people.with_children = 1;
          };
          if (Math.random() < 0.2) {
            people.with_relatives = 1;
          };
          if (Math.random() < 0.3) {
            people.with_friends = 1;
          };
          if (Math.random() < 0.2) {
            people.with_others = 1;
          };
        };
      };

      return people;
    };

    /**
     * Generates all the activities for a response.
     * `d` is a Date object.
     * `response` is the response so far, including in_out, home_work,
     * and all the people.
     * Returns an object with keys like 'do_work', 'do_meet' etc and 1 or 0 for
     * each value.
     */
    function generateActivities(d, response) {
      var activities = {};

      // Set the default of 0 for everything first:
      for (a in MAPPINESS_DATA_DICTIONARY.activities) {
        activities[a] = 0;
      };

      if (response.home_work == 'work') {
        // Worky things!
        if (Math.random() < 0.9) { activities.do_work = 1; };

        // Some other probably mutually-exclusive things:
          
        if (response.with_clients == 1) {
          if      (Math.random() < 0.8)  { activities.do_meet = 1; }
          else if (Math.random() < 0.2)  { activities.do_chat = 1; };

        } else if (response.with_peers == 1) {
          if      (Math.random() < 0.4)  { activities.do_meet = 1; }
          else if (Math.random() < 0.1)  { activities.do_chat = 1; };

        } else {
          if      (Math.random() < 0.2)  { activities.do_admin = 1; }
          else if (Math.random() < 0.1)  { activities.do_net = 1; }
          else if (Math.random() < 0.05) { activities.do_compgame = 1; }
          else if (Math.random() < 0.1)  { activities.do_other = 1; };
        };

      } else if (response.home_work == 'home') {
        // Caring.
        if (response.with_children == 1) {
          if (Math.random() < 0.2) { activities.do_childcare = 1; };
        };
        if (response.with_relative == 1) {
          if (Math.random() < 0.1) { activities.do_care = 1; };
        };
        // Chatting.
        if (response.with_partner == 1 || response.with_friends == 1
            || response.with_relatives == 1 || response.with_children == 1
            || response.with_others == 1) {
          if (Math.random() < 0.3) { activities.do_chat = 1; };
        };

        // Other stuff. I'm sure the chances of things here could be mucb
        // better. Especially given how rarely we'll get to things near the
        // end.
        if      (Math.random() < 0.2) { activities.do_tv = 1; } 
        else if (Math.random() < 0.1) { activities.do_music = 1; } 
        else if (Math.random() < 0.1) { activities.do_read = 1; } 
        else if (Math.random() < 0.1) { activities.do_chores = 1; } 
        else if (Math.random() < 0.1) { activities.do_rest = 1; } 
        else if (Math.random() < 0.1) { activities.do_cook = 1; } 
        else if (Math.random() < 0.1) { activities.do_wash = 1; } 
        else if (Math.random() < 0.1) { activities.do_admin = 1; } 
        else if (Math.random() < 0.1) { activities.do_msg = 1; } 
        else if (Math.random() < 0.1) { activities.do_net = 1; } 
        else if (Math.random() < 0.1) { activities.do_speech = 1; } 
        else if (Math.random() < 0.1) { activities.do_gardening = 1; } 
        else if (Math.random() < 0.1) { activities.do_compgame = 1; } 
        else if (Math.random() < 0.1) { activities.do_game = 1; } 
        else if (Math.random() < 0.1) { activities.do_art = 1; } 
        else if (Math.random() < 0.1) { activities.do_pet = 1; } 
        else if (Math.random() < 0.1) { activities.do_sport = 1; } 
        else if (Math.random() < 0.1) { activities.do_work = 1; }
        else if (Math.random() < 0.1) { activities.do_bet = 1; } 
        else if (Math.random() < 0.1) { activities.do_sick = 1; };

      } else {
        // Not at home or work.
        
        if (response.in_out == 'vehicle' && Math.random() < 0.7) { 
          activities.do_travel = 1;
        }; 

        // With people:
        if ((response.with_partner == 1 || response.with_relatives == 1
                    || response.with_peers == 1 || response.with_clients == 1
                    || response.with_friends == 1)
                && Math.random() < 0.3) {
          activities.do_chat = 1;
        };

        // More mutually-exclusive activities:

        // Working:
        if (activities.do_chat == 0
            && isWorkingHours(d)
            && (response.with_clients == 1 || response.with_peers == 1)
            && Math.random() < 0.4) {
          activities.do_meet = 1;
        
        // Indoors:
        } else if (response.in_out == 'in' && Math.random() < 0.1) {
          activities.do_tv = 1;
        } else if (response.in_out == 'in' && Math.random() < 0.1) {
          activities.do_theatre = 1;
        } else if (response.in_out == 'in' && Math.random() < 0.1) {
          activities.do_museum = 1;

        // Outdoors:
        } else if (response.in_out == 'out' && Math.random() < 0.1) {
          activities.do_walk = 1;
        } else if (response.in_out == 'out' && Math.random() < 0.1) {
          activities.do_gardening = 1;
        } 

        // Anywhere, with anyone:
        else if (Math.random() < 0.1) { activities.do_work = 1; } 
        else if (Math.random() < 0.1) { activities.do_shop = 1; } 
        else if (Math.random() < 0.1) { activities.do_wait = 1; } 
        else if (Math.random() < 0.1) { activities.do_pet = 1; } 
        else if (Math.random() < 0.1) { activities.do_msg = 1; } 
        else if (Math.random() < 0.1) { activities.do_net = 1; } 
        else if (Math.random() < 0.1) { activities.do_music = 1; } 
        else if (Math.random() < 0.1) { activities.do_speech = 1; } 
        else if (Math.random() < 0.1) { activities.do_read = 1; } 
        else if (Math.random() < 0.1) { activities.do_match = 1; } 
        else if (Math.random() < 0.1) { activities.do_sport = 1; } 
        else if (Math.random() < 0.1) { activities.do_compgame = 1; } 
        else if (Math.random() < 0.1) { activities.do_game = 1; } 
        else if (Math.random() < 0.1) { activities.do_bet = 1; } 
        else if (Math.random() < 0.1) { activities.do_art = 1; } 
      
      };

      // Eating and drink could happen in any location, but is more time
      // dependent.
      var h = d.getHours();

      // Drinking.
      if (h <= 17) {
        if (Math.random() < 0.08) { activities.do_caffeine = 1; };
      };
      if (response.home_work !== 'work' && activities.do_caffeine !== 1) {
        if (h >= 12 && h <= 17) {
          if (Math.random() < 0.05) { activities.do_booze = 1; };
        } else if (h >= 18) {
          if (Math.random() < 0.2) { activities.do_booze = 1; };
        };
      };
      if ((h >= 6 && h <= 8) || (h >= 12 && h <= 14) || (h >= 19 && h <= 21)) {
        if (Math.random() < 0.5) { activities.do_eat = 1; };
      };

      // Ensure there's at least one activity checked.

      var doingSomething = false;
      for (a in activities) {
        if (activities[a] == 1) {
          doingSomething = true;
        };
      };
      if (doingSomething == false) { activities.do_other = 1; };

      return activities; 
    };

    
    function isWorkingHours(d) {
      var day = d.getDay(),
          hours = d.getHours();

      if (day > 0 && day < 6 && hours >= 9 && hours <= 17) {
        return true;
      } else {
        return false;
      };
    };

    function isWeekend(d) {
      var day = d.getDay();
      if (day == 0 || day == 7) {
        return true;
      } else {
        return false;
      };
    };

    function isSleepTime(d) {
      var hours = d.getHours();
    
      if (hours <= 7 || hours >= 23) {
        return true;
      } else {
        return false;
      };
    };

    /**
     * Returns a string representing a date/time in the format
     * 2011-03-13 12:11:26 +0100 
     * d is a Date object.
     */
    function formatDate(d) {
      // Add a leading 0 if n is less than 10.
      var fixNum = function(n) {
        return (n < 10 ? '0' : '') + n;
      };

      // Given a Date.getTimezoneOffset(), returns a string like '+0100'.
      var formatTZ = function(offset) {
        return (-offset < 0 ? '-' : '+') +
              fixNum(Math.abs(offset / 60)) +
              '00'; 
      };

      return d.getFullYear() + '-' + 
             fixNum(d.getMonth() + 1) + '-' +
             fixNum(d.getDate()) + ' ' +
             fixNum(d.getHours()) + ':' +
             fixNum(d.getMinutes()) + ':' +
             fixNum(d.getSeconds()) + ' ' +
             formatTZ(d.getTimezoneOffset());
    };

    exports.days = function(_) {
      if (!arguments.length) return days;
      days = _;
      return this;
    };

    exports.responsesPerDay = function(_) {
      if (!arguments.length) return responsesPerDay;
      responsesPerDay = _;
      return this;
    };

    exports.startHour = function(_) {
      if (!arguments.length) return startHour;
      startHour = _;
      return this;
    };

    exports.endHour = function(_) {
      if (!arguments.length) return endHour;
      endHour = _;
      return this;
    };

    return exports;
  };
});

