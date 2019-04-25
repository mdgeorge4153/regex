define(['induct','re', 'util'],
function(induct,  re,   util) {

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

function ofNFA(nfa) {
  var start = util.unique('start');
  var end   = util.unique('accept');

  return make.apply({
    Q: util.union(nfa.Q, [start,end]),
    Σ: nfa.Σ,
    δ: function δ(q1,q2) {
      var result = re.nil();

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

function make() {
  // check invariant

  /** if possible, remove a state; otherwise return a regular expression */
  this.simplify = function() {
    if (this.Q.size > 2) {

      var me = this;

      // find a non-start, non-accept state
      var removed = undefined;
      this.Q.forEach(function (q) {
        if (q != this.q0 && q != this.a)
          removed = q;
      }, this);

      // remove the state, replacing the transitions through the 
      return make.apply({
        Q: util.remove(me.Q, removed),
        Σ: me.Σ,
        δ: function(q1, q2) {
          var old  = me.δ(q1,q2);
          var go   = me.δ(q1, removed);
          var stay = re.star(me.δ(removed,removed));
          var back = me.δ(removed,q2);
           
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


  this.log = function log() {
    console.log(this.Q);
    for (var q1 of this.Q)
      for (var q2 of this.Q) {
        r = this.δ(q1,q2);
        if (this.δ(q1,q2).type != '∅')
          console.log(q1 + " -- " + r + " --> " + q2);
      }
  }

  return this;

}

return {ofNFA: ofNFA};

});

