
requirejs.config({
  baseUrl: "src",
  paths: {
    "lib":  "../lib",
  },
});

require(['re', 'lib/domReady!'],
function(RE,   doc) {

var process  = doc.getElementById('process');
var regex    = doc.getElementById('regex');
var tree     = doc.getElementById('tree');
var pretty   = doc.getElementById('pretty');
var examples = doc.getElementById('examples');

var emptySet = doc.getElementById('∅');
var emptyStr = doc.getElementById('ε');

function insert(input, str) {
  input.focus();
  var n = input.selectionStart;
  var front = input.value.slice(0,input.selectionStart);
  var back  = input.value.slice(input.selectionEnd);
  input.value = front + str + back;
  input.selectionStart = n+1;
  input.selectionEnd   = n+1;
}

emptySet.onclick = function() { insert(regex, '∅'); };
emptyStr.onclick = function() { insert(regex, 'ε'); };

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
    e.sort();
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
