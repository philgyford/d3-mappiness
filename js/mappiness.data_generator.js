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

      if (previousResponse === undefined) {
        
      } else {
      
      };

      console.log(response);
      return response;
    };


    function generatePlace(d) {
      var day = d.getDay(),
          hours = d.getHours(),
          in_out,
          home_work;

      if (day > 0 && day < 6 && hours >= 9 && hours <= 17) {
        // Mon-Fri, 9-6, at work, maybe.
        var chance = Math.random();
        if (chance < 0.8) {
          home_work = 'work'; 
        } else if (chance < 0.9) {
          home_work = 'home';
        } else {
          home_work = 'other';
        };
      } else if (day == 0 || day == 7) {
        // Weekend.
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

      if (hours <= 7 || hours >= 23) {
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

