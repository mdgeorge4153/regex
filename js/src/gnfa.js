import induct from './induct.js';
import re     from './re.js';
import * as Util from './util.js';

/**
 * A Generalized NFA is an object with the following fields:
 *
 * Q: a finite set
 * Σ: a finite set
 * δ: (Q ∪ {q0,a}) × (Q ∪ {q0,a}) → RE
 * q0 ∉ Q
 * a  ∉ Q
 *
 * we maintain the following invariants:
 *   - for all q, δ(q,q0) = ∅
 *   - for all q, δ(a,q)  = ∅
 *   - q0 ≠ a
 */

export class GNFA {
  constructor(spec) {
    this.Q  = spec.Q;
    this.Σ  = spec.Σ;
    this.δ  = spec.δ;
    this.q0 = spec.q0;
    this.a  = spec.a;
  }

  toRE() {
    if (!this.Q.isEmpty())
      throw 'not simplified';

    return this.δ(this.q0, this.a);
  }

  /** if possible, remove a state; otherwise return a regular expression */
  simplify() {
    if (this.Q.isEmpty())
      throw 'already simplified';

    let me = this;

    let removed = this.Q.choose();

    // remove the state, replacing the transitions through the 
    return new GNFA({
      Q: me.Q.minus(new FiniteSet([removed], me.Q.equality));
      Σ: me.Σ,
      δ: function(q1, q2) {
        let old  = me.δ(q1,q2);
        let go   = me.δ(q1, removed);
        let stay = re.star(me.δ(removed,removed));
        let back = me.δ(removed,q2);

        return re.alt(old, re.cat(re.cat(go,stay),back)).simplify();
      },
      q0: me.q0,
      a:  me.a
    });
  }

  isSimplified() {
    return this.Q.isEmpty();
  }
}

function ofNFA(nfa) {
  let start = new Symbol('start');
  let end   = new Symbol('accept');

  return new GNFA({
    Q: nfa.Q,
    Σ: nfa.Σ,
    δ: function δ(q1,q2) {
      if (q1 == start)
        return q2 == nfa.q0 ? re.ε() : re.nil();
      if (q1 == end)
        return re.nil();

      if (q2 == end)
        return nfa.A.has(q1) ? re.ε() : re.nil();
      if (q2 == start)
        return re.nil();

      let result = re.nil();
      this.Σ.forEach(function (a) {
        if (nfa.δ(q1,a).has(q2))
          result = re.alt(result,re.str(a));
      });
      return result.simplify();
    },
    q0: start,
    a:  end
  });
}

return {ofNFA: ofNFA};

});

