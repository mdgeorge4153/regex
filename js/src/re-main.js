import RE from './re.js';

let doc = document;

let process  = doc.getElementById('process');
let regex    = doc.getElementById('regex');
let tree     = doc.getElementById('tree');
let pretty   = doc.getElementById('pretty');
let simple   = doc.getElementById('simple');
let examples = doc.getElementById('examples');

let emptySet = doc.getElementById('∅');
let emptyStr = doc.getElementById('ε');

//let nfa = NFA.example;
//let gnfa = GNFA.ofNFA(nfa);
//while (gnfa.Q.size > 2)
//  gnfa = gnfa.simplify();

//console.log(gnfa.simplify().toString());
//regex.innerHTML = gnfa.simplify().toString();

function insert(input, str) {
  input.focus();
  let n = input.selectionStart;
  let front = input.value.slice(0,input.selectionStart);
  let back  = input.value.slice(input.selectionEnd);
  input.value = front + str + back;
  input.selectionStart = n+1;
  input.selectionEnd   = n+1;
}

emptySet.onclick = function() { insert(regex, '∅'); };
emptyStr.onclick = function() { insert(regex, 'ε'); };

process.onclick = function() {
  try {
    let re = RE.parse(regex.value);
    pretty.innerHTML = re.toString();
    simple.innerHTML = re.simplify().toString();

    while (tree.hasChildNodes())
      tree.removeChild(tree.firstChild);

    re.appendTo(tree);

    while (examples.hasChildNodes())
      examples.removeChild(examples.firstChild);
    let e = re.examples(10);
    // e.sort();
    for (let i of e) {
      let li = doc.createElement('li');
      li.appendChild(doc.createTextNode('"' + i + '"'));
      examples.appendChild(li);
    }
  }
  catch(e) {
    alert(e);
  }
};

process.disabled = false;

