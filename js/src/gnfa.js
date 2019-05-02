import induct from './induct.js';
import re     from './re.js';
import * as Util from './util.js';

/**
 * A Generalized NFA is an object with the following fields:
 *
 * Q: a finite set
 * Σ: a finite set
 * δ: Q × Q → RE
 * q0 ∈ Q
 * a  ∈ Q
 *
 * we maintain the following invariants:
 *   - for all q, δ(q,q0) = ∅
 *   - for all q, δ(a,q)  = ∅
 *   - q0 ≠ a
 */

export class GNFA {
  constructor(spec) {
    this.Q  = new Set(spec.Q);
    this.Σ  = new Set(spec.Σ);
    this.δ  = spec.δ;
    this.q0 = spec.q0;
    this.a  = spec.a;

    this.Qord = new Set(this.Q);
    this.Qord.remove(q0);
    this.Qord.remove(a);
  }

  checkInvariant() {
    if (!this.Q instanceof Set) throw 'Q is not a set';
    if (!this.Σ instanceof Set) throw 'Σ is not a set';
    for (let q1 of this.Q)
      for (let q2 of this.Q)
        if (!this.δ(q1,q2) instanceof RE)
                                throw 'δ is not a function δ:Q×Q→RE';
    if (!this.q0 in this.Q)     throw 'q0 ∉ Q';
    if (!this.a  in this.Q)     throw 'a ∉ Q';
    if (!this.q0 != this.a)     throw 'a = q0';
    for (let q of this.Q)
      if (!this.δ(q,q0) != RE.nil)
                                throw 'δ(' + q.toString() + ', q0) ≠ ∅';
    for (let q of this.Q)
      if (!this.δ(a,q)  != RE.nil)
                                throw 'δ(a, ' + q.toString() + ') ≠ ∅';
  }


  /** if possible, remove a state; otherwise return a regular expression */
  simplify() {
    if (this.Q.size > 2) {

      let me = this;

      // find a non-start, non-accept state
      let removed = undefined;
      this.Q.forEach(function (q) {
	if (q != this.q0 && q != this.a)
	  removed = q;
      }, this);

      // remove the state, replacing the transitions through the 
      return make.apply({
	Q: Util.remove(me.Q, removed),
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
    else {
      // return regular expression
      return this.δ(this.q0, this.a);
    }
  }

  return this;

}

class GNFA () {

}

function ofNFA(nfa) {
  let start = new Symbol('start');
  let end   = new Symbol('accept');

  return make.apply({
    Q: Util.union(nfa.Q, [start,end]),
    Σ: nfa.Σ,
    δ: function δ(q1,q2) {
      let result = re.nil();

      if (q1 == start)
        return q2 == nfa.q0 ? re.ε() : re.nil();
      if (q1 == end)
        return re.nil();

      if (q2 == end)
        return nfa.A.has(q1) ? re.ε() : re.nil();
      if (q2 == start)
        return re.nil();

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

