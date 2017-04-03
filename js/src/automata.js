define(['lib/buckets'],
function(buckets) {

/******************************************************************************/
/** inductive strings *********************************************************/
/******************************************************************************/

/**
 * this function makes it easier to write inductively defined
 * functions on strings.
 */
function apply(s, f) {
  if (s == '')
    return f.ε;
  else
    return f.xa(apply(s.slice(0,-1), f), s.charAt(-1));
}

/**
 * examples:
 */

function len(s) {
  return apply(s, {
    ε:  0,
    xa: function (x, a) { return 1 + len(x); }
  });
}

function cat(s1, s2) {
  return apply(s2, {
    ε:  s1,
    xa: function (x, a) { return cat(s1,x) + a; }
  });
}

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

function makeDFA() {
  this.δhat = function δhat(q,x) {
    return apply(x,{
      ε:  q,
      xa: function (x, a) { return this.δ(this.δhat(q,x), a); }
    });
  }

  this.accepts = function accepts(x) {
    return this.F.contains(this.δhat(this.q0, x));
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

var even0odd1 = makeDFA.apply({
  Q: new buckets.Set(['ee', 'eo', 'oe', 'oo']),
  Σ: new buckets.Set(['0', '1']),
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
  F: new buckets.Set(['oe'])
});

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

function makeNFA() {

  this.δhat = function δhat(q, x) {
    return apply(x, {
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

var exampleNFA = makeNFA.apply({
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

/******************************************************************************/
/** ε-NFA *********************************************************************/
/******************************************************************************/


/******************************************************************************/
/** Generalized NFA ***********************************************************/
/******************************************************************************/


/******************************************************************************/
/** DFA -> NFA ****************************************************************/
/******************************************************************************/


/******************************************************************************/
/** NFA -> DFA ****************************************************************/
/******************************************************************************/


/******************************************************************************/
/** NFA -> RE *****************************************************************/
/******************************************************************************/


/******************************************************************************/
/** RE -> NFA *****************************************************************/
/******************************************************************************/


/******************************************************************************/
/** DFA Optimization **********************************************************/
/******************************************************************************/



});

