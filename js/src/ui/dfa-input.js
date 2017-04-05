
define(['lib/d3'],
function(d3) {

// create table:
//   add thead, tr, state/q0/f/add char
//   add tbody, tr with add state button
// update:
//   set header tr data to alphabet
//     create: insert before last child
//     update: 
//   add rows

return function render(table, dfa) {

var thead = table.selectAll('thead').data([dfa]);

/** First-time setup **********************************************************/

var header = thead.enter().append('thead').append('tr');

header.append("th").text("state");
header.append("th").text("q0");
header.append("th").text("F").attr('class','border');

header.append('th').append('input')
  .attr('type', 'button')
  .attr('name', 'addChar')
  .attr('value', 'add character')
;

var tbody = table.selectAll('tbody').data([dfa]);

var footer = tbody.enter().append('tbody').append('tr').append('th')
  .attr('colspan','3')
  .attr('class','border')
  .append('input')
    .attr('type','button')
    .attr('name','addState')
    .attr('value','add state')
;

/** Alphabet ******************************************************************/

var chars  = table.select('thead tr').selectAll("th.char").data(dfa.Σ);
var exit   = chars.exit().remove();

var enter  = chars.enter().insert('th','th:last-child')
 .attr('class', 'char')
;

enter.append('input')
  .attr('class','char')
;

enter.merge(chars).select('input.char')
  .attr('name', function(d,i) { return 'a' + i; })
  .attr('value', function(d) { return d; })

enter.append('input')
  .attr('class','x')
  .attr('type','button')
  .attr('value','x')
;

enter.merge(chars).select('input.x')
  .attr('name', function(d,i) { return 'xa' + i; })

/******************************************************************************/

var states = table.select('tbody').selectAll('tr.state').data(dfa.Q);
var exit   = states.exit().remove();

var enter = states.enter().insert('tr','tr:last-child')
  .attr('class','state')
;

var state = enter.append('th');

state.append('input')
  .attr('class','x')
  .attr('name', function(d,i) { return 'xq' + i; })
  .attr('value', 'x')
  .attr('type', 'button')
;

state.append('input')
  .attr('name', function(d,i) { return 'q' + i; })
  .attr('value', function(d)  { return d; })
  .attr('class', 'state')
;

enter.append('th').append('input')
  .attr('type','radio')
  .attr('name','start')
  .attr('value', function(d,i) { return 'q' + i; })
  .attr('checked', function(d) { return d == dfa.q0 ? 'checked' : null; })

enter.append('th').attr('class','border').append('input')
  .attr('type','checkbox')
  .attr('name',function(d,i) { return 'q' + i + 'f'; })
  .attr('checked', function(d) { return dfa.F.includes(d) ? 'checked' : null; })
;

/** Transitions ***************************************************************/

var update = enter.merge(states);

var cells = update.selectAll('td').data(dfa.Σ);
cells.exit().remove();
cells.enter().append('td').append('input')
  .attr('class', 'state')
  .attr('value', function(d,i) { return dfa.δ(d3.select(this.parentNode.parentNode).datum(), d); })
;

};

});
