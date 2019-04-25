define(['lib/buckets', 'induct','re'])
function(Buckets, induct, re) {

/**
 * A Generalized NFA is an object with the following fields:
 *
 * Q: a finite set (with methods contains and forEach)
 * Σ: a finite set (with methods contains and forEach)
 * δ: Q × Q → RE
 * q0 ∈ Q
 * a  ∈ Q
 *
 * we maintain the invariant that for all q, δ(q, q0) = ∅ and δ(a,q) = ∅
 */

function make() {
  // check invariant
  
  if (this.δ(

  /** if possible, remove a state; otherwise return a regular expression */
  this.simplify = function() {
    if (this.Q.size() > 2) {
    }
    else {
      // return regular expression
      return {
        this.δ(this.q0, this.a);
      }
    }
  }
}

}

