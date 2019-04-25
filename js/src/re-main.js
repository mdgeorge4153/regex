
requirejs.config({
  baseUrl: "src",
  paths: {
    "lib":  "../lib",
  },
});

require(['re', 'dfa', 'gnfa', 'nfa', 'lib/domReady!'],
function( RE,   DFA,   GNFA,   NFA,   doc) {

var process  = doc.getElementById('process');
var regex    = doc.getElementById('regex');
var tree     = doc.getElementById('tree');
var pretty   = doc.getElementById('pretty');
var simple   = doc.getElementById('simple');
var examples = doc.getElementById('examples');

var emptySet = doc.getElementById('∅');
var emptyStr = doc.getElementById('ε');

var nfa = NFA.example;
var gnfa = GNFA.ofNFA(nfa);
while (gnfa.Q.size > 2)
  gnfa = gnfa.simplify();

console.log(gnfa.simplify().toString());
regex.innerHTML = gnfa.simplify().toString();

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
    simple.innerHTML = re.simplify().toString();

    while (tree.hasChildNodes())
      tree.removeChild(tree.firstChild);

    re.appendTo(tree);

    while (examples.hasChildNodes())
      examples.removeChild(examples.firstChild);
    var e = re.examples(10);
    // e.sort();
    for (var i of e) {
      var li = doc.createElement('li');
      li.appendChild(doc.createTextNode('"' + i + '"'));
      examples.appendChild(li);
    }
  }
  catch(e) {
    alert(e);
  }
};

process.disabled = false;

});
