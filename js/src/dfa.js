import {induct} from './induct.js';
import FiniteSet from './finiteSet.js';

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
    this.Q  = spec.Q;
    this.Σ  = spec.Σ;
    this.δ  = spec.δ;
    this.q0 = spec.q0;
    this.A  = spec.A;
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
  Q: new FiniteSet(['ee', 'eo', 'oe', 'oo'], FiniteSet.primitive),
  Σ: new FiniteSet(['0', '1'], FiniteSet.primitive),
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
  A: new FiniteSet(['oe'], FiniteSet.primitive)
});

/*    ┌──┐
 * → (q) │ a,b,c
 *    ↑  │
 *    └──┘
 */

export let allStrings = new DFA({
  Q: new FiniteSet(['q'], FiniteSet.primitive),
  Σ: new FiniteSet(['a','b','c'], FiniteSet.primitive),
  δ: (q,a) => 'q',
  q0: 'q',
  A: new FiniteSet(['q'], FiniteSet.primitive)
});

/** NFA to DFA conversion *****************************************************/

export function binaryDivBy(m) {
  return new DFA({
    Q: new FiniteSet([...Array(m).keys()], FiniteSet.primitive), 
    Σ: new FiniteSet([0,1], FiniteSet.primitive),
    δ: (q,a) => (2*q + a) % m,
    q0: 0,
    A:  new FiniteSet(0, FiniteSet.primitive)
  });
}

/** DFA constructions *********************************************************/

/**
 * this helper function creates a DFA that simulates the two input DFAs
 *
 * precondition: m1.Σ = m2.Σ
 * accept([q1,q2]) should return true if [q1,q2] is an accepting state
 */
function dfa_cross(m1, m2, shouldAccept) {
  let Q = m1.Q.cross(m2.Q);
  if (!m1.Σ.equals(m2.Σ))
    throw 'alphabets must be equal to combine DFAs';

  return new DFA({
    Q:  Q,
    Σ:  m1.Σ,
    δ:  ([q1,q2],a) => [m1.δ(q1,a), m2.δ(q2,a)],
    q0: [m1.q0, m2.q0],
    A:  Q.suchThat(shouldAccept)
  });
}

export function union(m1, m2) {
  return dfa_cross(([q1,q2]) => m1.A.contains(q1) || m2.A.contains(q2));
}

export function intersection(m1,m2) {
  return dfa_cross(([q1,q2]) => m1.A.contains(q1) && m2.A.contains(q2));
}

export function difference(m1,m2) {
  return dfa_cross(([q1,q2]) => m1.A.contains(q1) && !m2.A.contains(q2));
}

export function symmetricDifference(m1,m2) {
  return dfa_cross(([q1,q2]) => m1.A.contains(q1) && !m2.A.contains(q2)
                           || m2.A.contains(q2) && !m1.A.contains(q1));
}

/** DFA complement ************************************************************/

export function complement(m) {
  return new DFA({
    Q:  m.Q,
    Σ:  m.Σ,
    δ:  m.δ,
    q0: m.q0,
    A:  m.Q.minus(m.A)
  });
}

/** NFA to DFA conversion *****************************************************/

export function ofNFA(n) {
  return new DFA({
    Q:  n.Q.powerFiniteSet(),
    Σ:  n.Σ,
    δ:  (s, a) => s.bigUnion(qn => n.δ(qn)),
    q0: new FiniteSet(n.q0, n.Q.equality),
    A:  Q.suchThat(s => !s.intersect(n.A).isEmpty())
  });
}

/** eNFA to DFA conversion ****************************************************/

export function ofεNFA(n) {
  return new DFA({
    Q:  n.Q.powerFiniteSet().map(n.εclose, FiniteSet.equals),
    Σ:  n.Σ,
    δ:  (s, a) => s.bigUnion(q => n.δhat(q,a)),
    q0: n.εclose(new FiniteSet(n.q0, n.Q.equality)),
    A:  Q.suchThat(s => !s.intersect(n.A).isEmpty())
  });
}

/** DFA optimization **********************************************************/

/** Group states into equivalence classes */
export function simplify(m) {
  function equiv(q1,q2) {
    throw 'not implemented';
  }

  return new DFA({
    Q: new FiniteSet(m.Q, equiv),
    Σ: Σ,
    δ: m.δ,
    q0: m.q0,
    A: new FiniteSet(m.A, equiv)
  });
}

/** Remove unreachable states */
export function removeUnreachable(m) {
  throw 'Not implemented';
}


