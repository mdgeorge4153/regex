import render  from './ui/dfa-input.js';
import DFA     from './dfa.js';
import * as d3 from 'https://unpkg.com/d3@5.9.2/index.js?module';

var table = d3.select('table#dfa');

render(table, DFA.even0odd1);

