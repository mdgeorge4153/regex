import render  from './ui/dfa-input.js';
import {DFA,ofNFA,removeUnreachable} from './dfa.js';
import {NFA,example} from './nfa.js';
import * as d3 from 'd3';

let table = d3.select('table#dfa');

dfa = removeUnreachable(ofNFA(example));

render(table, dfa);

