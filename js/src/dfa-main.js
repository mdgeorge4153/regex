
requirejs.config({
  baseUrl: "src",
  paths: {
    "lib":  "../lib",
  },
});

require(['ui/dfa-input', 'dfa', 'lib/d3', 'lib/domReady!'],
function(render,         DFA, d3,       doc) {

var table = d3.select('table#dfa');

render(table, DFA.even0odd1);

});


