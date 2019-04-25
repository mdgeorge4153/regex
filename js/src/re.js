
define(['lib/buckets'],
function(Buckets) {


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
  // check invariant
  switch (this.type) {
    case 'ε': case '∅':
      break;

    case 'a':
      if (typeof this.val != 'string' || this.val.length != 1)
        throw 'invalid regular expression';
      break;

    case '~': case '+':
      make.apply(this.r1);
      make.apply(this.r2);
      break;

    case '*':
      make.apply(this.r);
      break;

    default:
      throw 'invalid regular expression';
  }

  /** Structural induction ****************************************************/
  function induct(visitor) {
    switch(this.type) {
      case 'ε': return visitor.ε;
      case '∅': return visitor.∅;
      case 'a': return visitor.str(this.val);
      case '~': return visitor.cat(this.r1, this.r2);
      case '+': return visitor.alt(this.r1, this.r2);
      case '*': return visitor.star(this.r);
    }
  }

  /** Language ****************************************************************/
  this.lang = function lang() {
    return this.induct({
      ε:    function()      { return '{ε}'; },
      ∅:    function()      { return '∅'; },
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
      ∅:    function ()   { return this; },
      star: function(r)   { return this; }
      str:  function(val) { return this; },
      cat:  function(r1,r2) {
        r1 = r1.simplify(); r2 = r2.simplify();
        if (r1.type == '∅' || r2.type == '∅')
          return ∅();
        if (r1.type == 'ε') return r2;
        if (r2.type == 'ε') return r1;
        return this;
      },
      alt: function(r1,r2) {
        if (r1.type == '∅') return r2;
        if (r2.type == '∅') return r1;
      },
    });
  }


  /** Example generation ******************************************************/

  function choose(e) {
    return e[Math.floor(Math.random()*e.length)];
  }

  /** return up to n examples from the language of this. */
  this.examples = function examples(n) {
    this.induct({
      ε:   function()    { return ['']; },
      ∅:   function()    { return []; },
      str: function(val) { return [val]; },
      cat: function(r1,r2) {
        var e1 = r1.examples(n); var e2 = r2.examples(n);
        var result = Buckets.Set();
        if (e1.length * e2.length <= n)
          for (var i in e1)
            for (var j in e2)
              result.add(e1[i] + e2[j]);
        else
          for (var i = 0; i < n; i++)
            result.add(choose(e1) + choose(e2));
        return result.toArray();
      },
      alt: function(r1,r2) {
        var e1 = r1.examples(n); var e2 = r2.examples(n);
        var result = Buckets.Set();
        if (e1.length + e2.length <= n) {
          for (var i in e1) result.add(e1[i]);
          for (var i in e2) result.add(e2[i]);
        }
        else if (e1.length <= n/2) {
          for (var i in e1) result.add(e1[i]);
          for (var i = e1.length; i < n; i++) result.add(choose(e2));
        }
        else if (e2.length <= n/2) {
          for (var i in e2) result.add(e2[i]);
          for (var i = e2.length; i < n; i++) result.add(choose(e1));
        }
        else {
          for (var i = 0; i < n/2; i++) result.add(choose(e1));
          for (var i = n/2; i < n; i++) result.add(choose(e2));
        }
        return result.toArray();
      },
      star: function(r) {
        var e = r.examples(n);
        var result = Buckets.Set();
        if (e.length == 0) return [''];
        for (var i = 0; i < n; i++) {
          var s = '';
          for (var j = 0; j < i; j++)
            s += choose(e);
          result.add(s);
        }
        return result.toArray();
      }
    }
  }

  /** Pretty printing *********************************************************/

  function parens(prec) {
    return this.induct({
      ε: function() { return 'ε'; },
      ∅: function() { return '∅'; },
      a: function(val) { switch(val) {
                  case 'ε': case '∅': case '*': case '+': case '(': case ')':
                            return '\\' + this.val;
                  default:  return this.val;
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
    return parens(5);
  }

  this.appendTo = function appendTo(dom) {
    switch (this.type) {
      case 'ε':
      case '∅': dom.appendChild(document.createTextNode(this.type));
                return;
      case 'a': dom.appendChild(document.createTextNode(this.val));
                return;
      case '+':
      case '~': dom.appendChild(document.createTextNode(this.type));
                var ul = document.createElement('ul');
                var li = document.createElement('li');
                this.r1.appendTo(li);
                ul.appendChild(li);
                li = document.createElement('li');
                this.r2.appendTo(li);
                ul.appendChild(li);
                dom.appendChild(ul);
                return;
      case '*': dom.appendChild(document.createTextNode('*'));
                var ul = document.createElement('ul');
                var li = document.createElement('li');
                this.r.appendTo(li);
                ul.appendChild(li);
                dom.appendChild(ul);
                return;
    }
  }

  return this;
}

/** Building REs **************************************************************/

val ∅    = function ()      { return make.apply({type: '∅'}); };
val ε    = function ()      { return make.apply({type: 'ε'}); };
val a    = function (val)   { return make.apply({type: 'a', val: val}); };
val cat  = function (r1,r2) { return make.apply({type: '~', r1: r1, r2: r2}); };
val alt  = function (r1,r2) { return make.apply({type: '+', r1: r1, r2: r2}); };
val star = function (r)     { return make.apply({type: '*', r: r}); };


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
        ∅: ∅, ε: ε, str:str, cat: cat, alt: alt, star: star
};

});

