
define(['util'],
function(util) {


/******************************************************************************/
/** RE ************************************************************************/
/******************************************************************************/

/** an RE r is an object with a 'type' field, which is either:
 *   - 'ε' or '∅'
 *   - 'a', in which case r.val ∈ Σ
 *   - '~' or '+', in which case r.r1 and r.r1 are regular expressions
 *   - '*', in which case r.r is a regular expression
 */

function make() {
  /** Structural induction ****************************************************/
  this.induct = function induct(visitor) {
    switch(this.type) {
      case 'ε': return visitor.ε.call(this);
      case '∅': return visitor.nil.call(this);
      case 'a': return visitor.str.call(this, this.val);
      case '~': return visitor.cat.call(this, this.r1, this.r2);
      case '+': return visitor.alt.call(this, this.r1, this.r2);
      case '*': return visitor.star.call(this, this.r);
      default:  throw 'invalid regular expression'; 
    }
  }

  // check invariant
  this.induct({
    ε:    function() {},
    nil:  function() {},
    str:  function(val) {
      if (typeof val != 'string' || val.length != 1)
        throw 'invalid regular expression';
    },
    cat:  function(r1,r2) {
      make.apply(r1); make.apply(r2);
    },
    alt:  function(r1,r2) {
      make.apply(r1); make.apply(r2);
    },
    star: function(r) {
      make.apply(r);
    }
  });

  /** Language ****************************************************************/
  this.lang = function lang() {
    return this.induct({
      ε:    function()      { return '{ε}'; },
      nil:  function()      { return '∅'; },
      str:  function(val)   { return '{' + val + '}'; },
      cat:  function(r1,r2) { return '{xy | x ∈ ' + r1.lang() + ', y ∈ ' + r2.lang() + '}'; },
      alt:  function(r1,r2) { return r1.lang() + ' ∪ ' + r2.lang() },
      star: function(r)     { return '{ x1x2...xn | xi ∈ ' + r.lang() + '}'; },
    });
  }

  /** Simplification **********************************************************/
  this.simplify = function simplify() {
    return this.induct({
      ε:    function ()   { return this; },
      nil:  function ()   { return this; },
      str:  function(val) { return this; },
      star: function(r)   {
        r = r.simplify();
        if (r.type == '∅') return ε();
        if (r.type == 'ε') return r;
        return star(r);
      },
      cat:  function(r1,r2) {
        r1 = r1.simplify(); r2 = r2.simplify();
        if (r1.type == '∅' || r2.type == '∅')
          return nil();
        if (r1.type == 'ε') return r2;
        if (r2.type == 'ε') return r1;
        return cat(r1,r2);
      },
      alt: function(r1,r2) {
        r1 = r1.simplify(); r2 = r2.simplify();
        if (r1.type == '∅') return r2;
        if (r2.type == '∅') return r1;
        return alt(r1,r2);
      },
    });
  }


  /** Example generation ******************************************************/

  /** return up to n examples from the language of this. */
  this.examples = function examples(n) {
    return this.induct({
      ε:   function()    { return new Set(['']); },
      nil: function()    { return new Set([]); },
      str: function(val) { return new Set([val]); },
      cat: function(r1,r2) {
        var e1 = r1.examples(n); var e2 = r2.examples(n);
        var result = new Set();
        if (e1.length * e2.length <= n)
          for (var i in e1)
            for (var j in e2)
              result.add(e1[i] + e2[j]);
        else
          for (var i = 0; i < n; i++)
            result.add(util.choose(e1) + util.choose(e2));
        return result;
      },
      alt: function(r1,r2) {
        var e1 = r1.examples(n); var e2 = r2.examples(n);
        var result = new Set();
        if (e1.length + e2.length <= n) {
          for (var i in e1) result.add(e1[i]);
          for (var i in e2) result.add(e2[i]);
        }
        else if (e1.length <= n/2) {
          for (var i in e1) result.add(e1[i]);
          for (var i = e1.length; i < n; i++) result.add(util.choose(e2));
        }
        else if (e2.length <= n/2) {
          for (var i in e2) result.add(e2[i]);
          for (var i = e2.length; i < n; i++) result.add(util.choose(e1));
        }
        else {
          for (var i = 0; i < n/2; i++) result.add(util.choose(e1));
          for (var i = n/2; i < n; i++) result.add(util.choose(e2));
        }
        return result;
      },
      star: function(r) {
        var e = r.examples(n);
        var result = new Set();
        if (e.length == 0) return [''];
        for (var i = 0; i < n; i++) {
          var s = '';
          for (var j = 0; j < i; j++)
            s += util.choose(e);
          result.add(s);
        }
        return result;
      }
    });
  }

  /** Pretty printing *********************************************************/

  this.parens = function parens(prec) {
    return this.induct({
      ε:   function() { return 'ε'; },
      nil: function() { return '∅'; },
      str: function(val) { switch(val) {
                  case 'ε': case '∅': case '*': case '+': case '(': case ')':
                            return '\\' + val;
                  default:  return '' + val;
                };
         },
      star: function(r) {
        return prec < 1 ? '(' + r.parens(1) + '*)' : r.parens(1) + '*';
      },
      cat:  function(r1,r2) {
        return prec < 2 ? '(' + r1.parens(2) + r2.parens(2) + ')' : r1.parens(2) + r2.parens(2);
      },
      alt:  function(r1,r2) {
        return prec < 3 ? '(' + r1.parens(3) + '+' + r2.parens(3) + ')' : r1.parens(3) + '+' + r2.parens(3);
      }
    });
  }

  this.toString = function toString() {
    return this.parens(5);
  }

  this.appendTo = function appendTo(dom) {
    function text(str) { dom.appendChild(document.createTextNode(str)); }
    function list(vals) {
      var ul = document.createElement('ul');
      for (var i in vals) {
        var li = document.createElement('li');
        vals[i].appendTo(li);
        ul.appendChild(li);
      }
      dom.appendChild(ul);
    }

    return this.induct({
      ε:    function()      { text('ε'); },
      nil:  function()      { text('∅'); },
      str:  function(val)   { text(val); },
      alt:  function(r1,r2) { text('alternation');   list([r1,r2]); },
      cat:  function(r1,r2) { text('concatenation'); list([r1,r2]); },
      star: function(r)     { text('closure');       list([r]); }
    });
  }

  return this;
}

/** Building REs **************************************************************/

function ε    ()      { return make.apply({type: 'ε'}); };
function nil  ()      { return make.apply({type: '∅'}); };
function str  (val)   { return make.apply({type: 'a', val: val}); };
function cat  (r1,r2) { return make.apply({type: '~', r1: r1, r2: r2}); };
function alt  (r1,r2) { return make.apply({type: '+', r1: r1, r2: r2}); };
function star (r)     { return make.apply({type: '*', r: r}); };


/** Parsing REs ***************************************************************/

/* 3 expr   = term   [+ term ...]
 * 2 term   = factor [factor factor ...]
 * 1 factor = base [*]
 * 0 base   = ( expr ) | a | ε | ∅
 */

function parse(str) {
  class Tokens {
    constructor(s) {
      this.s = s;
      this.i = 0;
    }

    peek() {
      return this.s[this.i];
    }

    consume(c) {
      if (this.s[this.i] != c)
        throw "invalid expression";

      this.i++;
    }
  }

  function parseExpr(tok) {
    var term = parseTerm(tok);

    switch(tok.peek()) {
      case '+':
        tok.consume('+');
        return {type: '+', r1: term, r2: parseExpr(tok)};
      default:
        return term;
    }
  }

  function parseTerm(tok) {
    var factor = parseFactor(tok);

    switch(tok.peek()) {
      case undefined:
      case ')':
      case '+':
      case '*': return factor;
      default:  return {type: '~', r1: factor, r2: parseTerm(tok)};
    }
  }

  function parseFactor(tok) {
    var base = parseBase(tok);

    switch(tok.peek()) {
      case '*':
        tok.consume('*');
        return {type: '*', r: base};
      default:
        return base;
    }
  }

  function parseBase(tok) {
    switch(tok.peek()) {
      case '(':
        tok.consume('(');
        var expr = parseExpr(tok);
        tok.consume(')');
        return expr;
      case 'ε':
        tok.consume('ε');
        return {type: 'ε'};
      case '∅':
        tok.consume('∅');
        return {type: '∅'};
      case undefined:
      case ')':
      case '+':
      case '*':
        throw 'illegal regular expression';
      case '\\':
        tok.consume('\\');
        if (tok.peek() == undefined)
          throw 'illegal regular expression';
      default:
        var result = tok.peek();
        tok.consume(result);
        return {type: 'a', val: result};
    }
  }

  var tok = new Tokens(str);
  var result = parseExpr(tok);
  if (tok.peek() != undefined)
    throw 'illegal regular expression';
  return make.apply(result);
}

return {parse: parse,
        nil: nil, ε: ε, str:str, cat: cat, alt: alt, star: star
};

});

