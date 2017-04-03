
requirejs.config({
  baseUrl: "src",
  paths: {
    "lib":  "../lib",
  },
});

require(['re', 'lib/insert', 'lib/domReady!'],
function(RE,   insertAtCaret, doc) {

var process  = doc.getElementById('process');
var regex    = doc.getElementById('regex');
var tree     = doc.getElementById('tree');
var pretty   = doc.getElementById('pretty');
var examples = doc.getElementById('examples');

process.onclick = function() {
  try {
    var re = RE.parse(regex.value);
    pretty.innerHTML = re.toString();

    while (tree.hasChildNodes())
      tree.removeChild(tree.firstChild);

    re.appendTo(tree);

    while (examples.hasChildNodes())
      examples.removeChild(examples.firstChild);
    var e = re.examples(10);
    for (var i in e) {
      var li = doc.createElement('li');
      li.appendChild(doc.createTextNode('"' + e[i] + '"'));
      examples.appendChild(li);
    }
  }
  catch(e) {
    alert(e);
  }
};

process.disabled = false;

});
