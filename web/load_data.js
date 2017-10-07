function loadData() {
  var jsonData;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     jsonData = this.responseText;
     loadMustache(jsonData);
    }
  };
  xhttp.open("GET", "data.json", true);
  xhttp.send();
}
//TODO mustache template is cached or something
function loadMustache(jsonData) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      mustacheData = this.responseText;
      jsonData = {
        recordings: JSON.parse(jsonData)
      };
      console.log(mustacheData);
      Mustache.parse(mustacheData);
      var rendered = Mustache.render(mustacheData, jsonData);
      var content = document.getElementById('content');
      content.innerHTML = rendered;
    }
  };
  xhttp.open("GET", "template.mustache", true);
  xhttp.send();
}
