define(['lib/buckets', 'induct'],
function(Buckets,      induct) {

/******************************************************************************/
/** NFA ***********************************************************************/
/******************************************************************************/

/**
 * An NFA is an object with the following fields:
 *
 * Q: a finite set (with methods contains and forEach)
 * Σ: a finite set (with methods contains and forEach)
 * δ: Q x Σ → set of states
 * q0 ∈ Q
 * F  ⊆ Q          (with methods contains and forEach)
 */

function make() {

  this.δhat = function δhat(q, x) {
    return induct(x, {
      ε:  buckets.Set([q]),
      xa: function(x, a) {
	var result = buckets.Set();
	this.δhat(q,x).forEach(function (qq) { result.union(this.δ(qq,a)); });
	return result;
      }
    });
  }

  this.accepts = function accepts(x) {
    var copy_of_final = new buckets.Set(this.F);
    copy_of_final.intersect(this.δhat(this.q0, x));
    return !copy_of_final.isEmpty();
  }
}

/** Examples: *****************************************************************/


/*                       ┌─ a ─┐
 *    ┌─ a ─>(q1)<─b─> (q3) <──┘
 *   q0       ↑a         │
 *    └─ b ─> q2 <──a────┘
 */

var example = make.apply({
  Q: new buckets.Set(['q0', 'q1', 'q2', 'q3']),
  Σ: new buckets.Set(['a', 'b']),
  δ: function(q,a) {
       if(q == 'q0' && a='a') return new buckets.Set(['q1']);
       if(q == 'q0' && a='b') return new buckets.Set(['q2']);
       if(q == 'q1' && a='a') return new buckets.Set([]);
       if(q == 'q1' && a='b') return new buckets.Set(['q3']);
       if(q == 'q2' && a='a') return new buckets.Set(['q1']);
       if(q == 'q2' && a='b') return new buckets.Set([]);
       if(q == 'q3' && a='a') return new buckets.Set(['q3', 'q2']);
       if(q == 'q3' && a='b') return new buckets.Set(['q1']);
       throw 'invalid state';
     },
  q0: 'q0',
  F:  new buckets.Set(['q1', 'q3'])
});


return {make: make, example: example};

});
