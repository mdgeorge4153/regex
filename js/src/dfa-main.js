import render  from './ui/dfa-input.js';
import {DFA,binaryDivBy} from './dfa.js';
import * as d3 from 'd3';

let table = d3.select('table#dfa');

render(table, binaryDivBy(5));

