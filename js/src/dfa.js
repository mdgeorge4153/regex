define(['lib/buckets', 'induct'],
function(Buckets,      induct) {

/******************************************************************************/
/** DFA ***********************************************************************/
/******************************************************************************/

/**
 * A DFA is an object with the following fields:
 *
 * Q: a finite set (with methods contains and forEach)
 * Σ: a finite set (with methods contains and forEach)
 * δ: Q x Σ → Q
 * q0 ∈ Q
 * F  ⊆ Q          (with methods contains and forEach)
 */

function make() {
  this.δhat = function δhat(q,x) {
    return induct(x,{
      ε:  q,
      xa: function (x, a) { return this.δ(this.δhat(q,x), a); }
    });
  };

  this.accepts = function accepts(x) {
    return this.F.contains(this.δhat(this.q0, x));
  };
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

var even0odd1 = make.apply({
  Q: new Buckets.Set(['ee', 'eo', 'oe', 'oo']),
  Σ: new Buckets.Set(['0', '1']),
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
     }
  q0: 'ee',
  F: new Buckets.Set(['oe'])
});

/** Exports *******************************************************************/

return {make: make, even0odd1: even0odd1};

});
