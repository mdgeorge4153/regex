import {induct} from './induct.js';
import FiniteSet from './finiteSet.js';

/******************************************************************************/
/** NFA ***********************************************************************/
/******************************************************************************/

/**
 * An NFA is an object with the following fields:
 *
 * Q: a FiniteSet
 * Σ: a FiniteSet
 * δ: Q x Σ → FiniteSet of states
 * q0 ∈ Q
 * A  ⊆ Q
 */

export default class NFA {

  constructor(spec) {
    this.Q  = spec.Q;
    this.Σ  = spec.Σ;
    this.δ  = spec.δ;
    this.q0 = spec.q0;
    this.A  = spec.A;
    Object.freeze(this);
  }

  δhat(q, x) {
    let m = this;
    return induct(x, {
      ε:  new Set([q],this.Q.equality),
      xa: (x,a) => m.δhat(q,x).bigUnion(qx => m.δ(qx,a))
    });
  }

  accepts(x) {
    return !this.δhat(this.q0,x).intersect(this.A).isEmpty();
  }
}

/** Examples: *****************************************************************/


/*                       ┌─ a ─┐
 *    ┌─ a ─>(q1)<─b─> (q3) <──┘
 *   q0       ↑a         │
 *    └─ b ─> q2 <──a────┘
 */

export let example = new NFA({
  Q: new FiniteSet(['q0', 'q1', 'q2', 'q3'], FiniteSet.primitive),
  Σ: new FiniteSet(['a', 'b'], FiniteSet.primitive),
  δ: function(q,a) {
       if(q == 'q0' && a=='a') return new FiniteSet(['q1'],       FiniteSet.primitive);
       if(q == 'q0' && a=='b') return new FiniteSet(['q2'],       FiniteSet.primitive);
       if(q == 'q1' && a=='a') return new FiniteSet([],           FiniteSet.primitive);
       if(q == 'q1' && a=='b') return new FiniteSet(['q3'],       FiniteSet.primitive);
       if(q == 'q2' && a=='a') return new FiniteSet(['q1'],       FiniteSet.primitive);
       if(q == 'q2' && a=='b') return new FiniteSet([],           FiniteSet.primitive);
       if(q == 'q3' && a=='a') return new FiniteSet(['q3', 'q2'], FiniteSet.primitive);
       if(q == 'q3' && a=='b') return new FiniteSet(['q1'],       FiniteSet.primitive);
       throw 'invalid state';
     },
  q0: 'q0',
  A:  new FiniteSet(['q1', 'q3'], FiniteSet.primitive)
});

