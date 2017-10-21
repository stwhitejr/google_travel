// TODO
// Add accordian tabs
// Get shortest and longest commute and compare to control's shortest and longest

function loadData() {
  loadJson('am');
  loadJson('pm');
}

function loadJson(prefix) {
  var jsonFile = prefix + '_data.json';
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     jsonData = JSON.parse(this.responseText);
     // Add shortest and longest durations to recording_times
     for (var i = 0; jsonData.length > i; i++) {
       const recordingTimes = jsonData[i].recording_times;
       for (var x = 0; recordingTimes.length > x; x++) {
        // Collect all the duration_in_traffic values into one array
         let recordingsDuration = [];
         for (var d = 0; recordingTimes[x].recordings.length > d; d++) {
          let currentDurationInTraffic = recordingTimes[x].recordings[d].duration_in_traffic;
          currentDurationInTraffic = currentDurationInTraffic.replace(' mins', '');
          if (currentDurationInTraffic.indexOf('hour') !== -1) {
            currentDurationInTrafficHour = currentDurationInTraffic.substr(0, 1);
            currentDurationInTraffic = currentDurationInTraffic.substr(6);
            currentDurationInTraffic = parseInt(currentDurationInTraffic) + (parseInt(currentDurationInTrafficHour) * 60);
          }
          recordingsDuration.push(currentDurationInTraffic);
         }
         // Compare all results for shortest and longest
         let shortestDuration = recordingsDuration[0];
         let longestDuration = recordingsDuration[0];
         for (var d = 1; recordingsDuration.length > d; d++) {
          if (longestDuration < recordingsDuration[d]) {
            longestDuration = recordingsDuration[d];
          }
          if (shortestDuration > recordingsDuration[d]) {
            shortestDuration = recordingsDuration[d];
          }
         }
         jsonData[i].recording_times[x].shortest = shortestDuration;
         jsonData[i].recording_times[x].longest = longestDuration;
         // Compare to first/control
         jsonData[i].recording_times[x].longest_diff = longestDuration - jsonData[0].recording_times[x].longest;
         jsonData[i].recording_times[x].shortest_diff = shortestDuration - jsonData[0].recording_times[x].shortest;
       }
     }
     jsonData = JSON.stringify(jsonData);
     loadMustache(jsonData, prefix);
    }
  };
  xhttp.open("GET", jsonFile, true);
  xhttp.send();
}

function loadMustache(jsonData, prefix) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      mustacheTemplate = this.responseText;
      jsonData = {
        locations: JSON.parse(jsonData)
      };
      contentId = prefix + '_content';
      Mustache.parse(mustacheTemplate);
      var rendered = Mustache.render(mustacheTemplate, jsonData);
      var content = document.getElementById(contentId);
      content.innerHTML = rendered;
    }
  };
  xhttp.open("GET", "template.mustache", true);
  xhttp.send();
}
