/******************************************************************************/
/** inductive strings *********************************************************/
/******************************************************************************/

/**
 * the induct function makes it easier to write inductively
 * defined functions on strings.  See examples below.
 */

define([], function() {

/**
 * examples:
 */

function len(s) {
  return induct(s, {
    ε:  0,
    xa: function (x, a) { return 1 + len(x); }
  });
}

function cat(s1, s2) {
  return induct(s2, {
    ε:  s1,
    xa: function (x, a) { return cat(s1,x) + a; }
  });
}

/** defintion of induct *******************************************************/

return function induct(s, f) {
  if (s == '')
    return f.ε;
  else
    return f.xa(induct(s.slice(0,-1), f), s.charAt(-1));
}

});

