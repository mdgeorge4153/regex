import * as d3 from 'd3';

// create table:
//   add thead, tr, state/q0/f/add char
//   add tbody, tr with add state button
// update:
//   set header tr data to alphabet
//     create: insert before last child
//     update: 
//   add rows

export default function render(table, dfa) {

let thead = table.selectAll('thead').data([dfa]);

/** First-time setup **********************************************************/

let header = thead.enter().append('thead').append('tr');

header.append("th").text("state");
header.append("th").text("q0");
header.append("th").text("F").attr('class','border');

header.append('th').append('input')
  .attr('type', 'button')
  .attr('name', 'addChar')
  .attr('value', 'add character')
;

let tbody = table.selectAll('tbody').data([dfa]);

let footer = tbody.enter().append('tbody').append('tr').append('th')
  .attr('colspan','3')
  .attr('class','border')
  .append('input')
    .attr('type','button')
    .attr('name','addState')
    .attr('value','add state')
;

/** Alphabet ******************************************************************/

let chars  = table.select('thead tr').selectAll("th.char").data([...dfa.Σ]);
let exit   = chars.exit().remove();

let enter  = chars.enter().append('th')//insert('th','th:last-child')
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

let states = table.select('tbody').selectAll('tr.state').data([...dfa.Q]);
exit   = states.exit().remove();

enter = states.enter().insert('tr','tr:last-child')
  .attr('class','state')
;

let state = enter.append('th');

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
  .attr('checked', function(d) { return dfa.A.has(d) ? 'checked' : null; })
;

/** Transitions ***************************************************************/

let update = enter.merge(states);

let cells = update.selectAll('td').data([...dfa.Σ]);
cells.exit().remove();
cells.enter().append('td').append('input')
  .attr('class', 'state')
  .attr('value', function(d,i) { return dfa.δ(d3.select(this.parentNode.parentNode).datum(), d); })
;

};

