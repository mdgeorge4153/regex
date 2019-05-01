import {induct} from './induct.js';

/******************************************************************************/
/** DFA ***********************************************************************/
/******************************************************************************/

/**
 * A DFA is an object with the following fields:
 *
 * Q: a finite set
 * Σ: a finite set
 * δ: Q x Σ → Q
 * q0 ∈ Q
 * A  ⊆ Q
 */

export default class DFA {
  constructor(spec) {
    this.Q  = new Set(spec.Q);
    this.Σ  = new Set(spec.Σ);
    this.δ  = spec.δ;
    this.q0 = spec.q0;
    this.A  = new Set(spec.A);
    Object.freeze(this);
  }

  δhat(q,x) {
    let m = this;
    return induct(x,{
      ε:  ()    => q,
      xa: (x,a) => m.δ(m.δhat(q,x), a),
    });
  }

  accepts(x) {
    return this.A.includes(this.δhat(this.q0, x));
  }
}

/** Examples ******************************************************************/

/*
 *        1
 * -→ ee ←-→ (eo)
 *     ↑      ↑
 *  0  |      | 0
 *     ↓      ↓
 *    oe ←--→ oo
 *        1
 */

export let even0odd1 = new DFA({
  Q: ['ee', 'eo', 'oe', 'oo'],
  Σ: ['0', '1'],
  δ: function(q,a) {
       if (q == 'ee' && a == '0') return 'oe';
       if (q == 'ee' && a == '1') return 'eo';
       if (q == 'eo' && a == '0') return 'oo';
       if (q == 'eo' && a == '1') return 'ee';
       if (q == 'oe' && a == '0') return 'ee';
       if (q == 'oe' && a == '1') return 'oo';
       if (q == 'oo' && a == '0') return 'eo';
       if (q == 'oo' && a == '1') return 'oe';
       throw 'invalid state';
     },
  q0: 'ee',
  A: ['oe'],
});

export let allStrings = new DFA({
  Q: ['q'],
  Σ: ['a','b','c'],
  δ: function(q,a) { return 'q'; },
  q0: 'q',
  A: ['q']
});

