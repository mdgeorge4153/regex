
/******************************************************************************/
/** NFA ***********************************************************************/
/******************************************************************************/

/**
 * An NFA is an object with the following fields:
 *
 * Q: a Set
 * Σ: a Set
 * δ: Q x Σ → Set of states
 * q0 ∈ Q
 * A  ⊆ Q
 */
function make() {

  this.δhat = function δhat(q, x) {
    return induct(x, {
      ε:  new Set([q]),
      xa: function(x, a) {
	var result = new Set();
	this.δhat(q,x).forEach(function (qq) { result.union(this.δ(qq,a)); });
	return result;
      }
    });
  }

  this.accepts = function accepts(x) {
    var copy_of_final = new Set(this.A);
    copy_of_final.intersect(this.δhat(this.q0, x));
    return !copy_of_final.isEmpty();
  }

  return this;
}

/** Examples: *****************************************************************/


/*                       ┌─ a ─┐
 *    ┌─ a ─>(q1)<─b─> (q3) <──┘
 *   q0       ↑a         │
 *    └─ b ─> q2 <──a────┘
 */

var example = make.apply({
  Q: new Set(['q0', 'q1', 'q2', 'q3']),
  Σ: new Set(['a', 'b']),
  δ: function(q,a) {
       if(q == 'q0' && a=='a') return new Set(['q1']);
       if(q == 'q0' && a=='b') return new Set(['q2']);
       if(q == 'q1' && a=='a') return new Set([]);
       if(q == 'q1' && a=='b') return new Set(['q3']);
       if(q == 'q2' && a=='a') return new Set(['q1']);
       if(q == 'q2' && a=='b') return new Set([]);
       if(q == 'q3' && a=='a') return new Set(['q3', 'q2']);
       if(q == 'q3' && a=='b') return new Set(['q1']);
       throw 'invalid state';
     },
  q0: 'q0',
  A:  new Set(['q1', 'q3'])
});


return {make: make, example: example};

});
