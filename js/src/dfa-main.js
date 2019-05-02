import render  from './ui/dfa-input.js';
import {DFA,even0odd1} from './dfa.js';
import * as d3 from 'd3';

let table = d3.select('table#dfa');

render(table, even0odd1);

