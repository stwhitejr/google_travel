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
         // Format shortest and longest to something more verbal
         if (shortestDuration >= 60) {
          hourAmount = Math.floor(shortestDuration / 60);
          minuteAmount = shortestDuration - (hourAmount * 60);
          shortestDuration = hourAmount + ' hour ' + minuteAmount + ' mins';
         } else {
          shortestDuration = shortestDuration + ' mins';
         }
         if (longestDuration >= 60) {
          hourAmount = Math.floor(longestDuration / 60);
          minuteAmount = longestDuration - (hourAmount * 60);
          longestDuration = hourAmount + ' hour ' + minuteAmount + ' mins';
         } else {
          longestDuration = longestDuration + ' mins';
         }
         jsonData[i].recording_times[x].shortest_verbal = shortestDuration;
         jsonData[i].recording_times[x].longest_verbal = longestDuration;
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
      interface();
    }
  };
  xhttp.open("GET", "template.mustache", true);
  xhttp.send();
}

function interface() {
  const locationRecordings = document.getElementsByClassName('Location-recordings--noncontrol');
  // const controlRecordings = document.getElementsByClassName('Location-recordings--control');
  // let controlI = 0;
  // let moveControlFlag;
  for (var i = 0; locationRecordings.length > i; i++) {
    const locationDataChild = locationRecordings[i].getElementsByClassName('LocationData')[0];
    // const controlRecordingsChild = controlRecordings[controlI].getElementsByClassName('LocationData--control')[0];
    // controlI++;
    // if (controlI % 6 <= 0) {
    //   controlI = 0;
    // }
    // if (i > 5) {
    //   moveControlFlag = true;
    // } else {
    //   moveControlFlag = false;
    // }
    locationRecordings[i].onclick = function() {
      this.classList.toggle('Location-recordings--active');
      locationDataChild.classList.toggle('hidden-node');
      // controlRecordingsChild.classList.toggle('hidden-node');
      const currentRecordingId = this.getAttribute('data-location-recording-id');
      const currentLocationElement = document.getElementById(currentRecordingId);
      // if (moveControlFlag) {
      //   moveControl(currentLocationElement.offsetTop);
      // }
    }
  }
}

// function moveControl(top) {
//   const control = document.getElementById('ControlCol');
//   const noncontrolTop = document.getElementById('NoncontrolCol').offsetTop;
//   control.style.marginTop = (top - noncontrolTop) + 'px';
// }
let toggleTimeActive;
function toggleTimes(time, showAll) {
  const times = document.getElementsByClassName('Location-recordings--noncontrol');
  if (toggleTimeActive) {
    showAll = true;
  }
  for (var i = 0; times.length > i; i++) {
    const timeIndex = times[i].getAttribute('data-recording-index');
    if (showAll) {
      times[i].classList.remove('hidden-node');
      toggleTimeActive = false;
    }
    if (time != null && !showAll) {
      if (time != timeIndex) {
        times[i].classList.toggle('hidden-node');
      }
      if (times.length === (i + 1)) {
        toggleTimeActive = true;
      }
    } else if (time != null && showAll) {
      // Restart once we've removed all hidden nodes
      if (times.length === (i + 1)) {
        toggleTimes(time, false);
      }
    }
  }
}