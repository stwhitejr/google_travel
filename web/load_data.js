// TODO
// Add toggles for set times only
// Add accordian tabs
// Better comparison window, only 1 result of control and fix it's position

function loadData() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     jsonData = this.responseText;
     loadMustache(jsonData, true);
     xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
       jsonData = this.responseText;
       loadMustache(jsonData, false);
      }
    };
    xhttp.open("GET", "pm_data.json", true);
    xhttp.send();
    }
  };
  xhttp.open("GET", "am_data.json", true);
  xhttp.send();
}

function loadMustache(jsonData, isAm) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      mustacheTemplate = this.responseText;
      jsonData = {
        locations: JSON.parse(jsonData)
      };
      if (isAm) {
        contentId = 'am_content';
      } else {
        contentId = 'pm_content';
      }
      Mustache.parse(mustacheTemplate);
      var rendered = Mustache.render(mustacheTemplate, jsonData);
      var content = document.getElementById(contentId);
      content.innerHTML = rendered;
    }
  };
  xhttp.open("GET", "template.mustache", true);
  xhttp.send();
}
