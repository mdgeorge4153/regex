import Util from './util.js';

export default class RE {
  /** Induction ***************************************************************/

  induct(visitor)  { throw 'not implemented; abstract base class.'; }
  constructor()    { }

  static ε    ()      { return new ε(); }
  static nil  ()      { return new Nil(); }
  static str  (val)   { return new Str(val); }
  static cat  (r1,r2) { return new Cat(r1,r2); }
  static alt  (r1,r2) { return new Alt(r1,r2); }
  static star (r)     { return new Star(r); }

  /** Printing ****************************************************************/

  toString() {
    return parens(this,5);
  }

  /** Language ****************************************************************/

  lang() {
    return this.induct({
      ε:    ()      => '{ε}',
      nil:  ()      => '∅',
      str:  (val)   => '{' + val + '}',
      cat:  (r1,r2) => '{xy | x ∈ ' + r1.lang() + ', y ∈ ' + r2.lang() + '}',
      alt:  (r1,r2) => r1.lang() + ' ∪ ' + r2.lang(),
      star: (r)     => '{ x1x2...xn | xi ∈ ' + r.lang() + '}',
    });
  }

  /** Helpers *****************************************************************/

  isNil() {
    return this.induct({
      nil: () => true,
      _:   () => false
    });
  }

  isε() {
    return this.induct({
      ε: () => true,
      _: () => false
    });
  }

  /** Simplification **********************************************************/

  simplify() {
    return this.induct({
      star(r) {
        r = r.simplify();
        return r.induct({
          ε:   () => RE.ε(),
          nil: () => RE.nil(),
          _:   () => RE.star(r)
        });
      },
      cat(r1,r2) {
	r1 = r1.simplify(); r2 = r2.simplify();

	if (r1.isNil() || r2.isNil())
	  return RE.nil();
	if (r1.isε()) return r2;
	if (r2.isε()) return r1;
	return RE.cat(r1,r2);
      },
      alt(r1,r2) {
	r1 = r1.simplify(); r2 = r2.simplify();
	if (r1 instanceof Nil) return r2;
	if (r2 instanceof Nil) return r1;
	return RE.alt(r1,r2);
      },
      _() {
        return this;
      }
    },this);
  }

  /** Example generation ******************************************************/

  /** return up to n examples from the language of this. */
  examples(n) {
    return this.induct({
      ε()        { return new Set(['']); },
      nil()      { return new Set([]); },
      str(val)   { return new Set([val]); },
      cat(r1,r2) {
        let e1 = r1.examples(n); let e2 = r2.examples(n);
        let result = new Set();
        if (e1.length * e2.length <= n)
          for (let i in e1)
            for (let j in e2)
              result.add(e1[i] + e2[j]);
        else
          for (let i = 0; i < n; i++)
            result.add(Util.choose(e1) + Util.choose(e2));
        return result;
      },
      alt: function(r1,r2) {
        let e1 = r1.examples(n); let e2 = r2.examples(n);
        let result = new Set();
        if (e1.length + e2.length <= n) {
          for (let i in e1) result.add(e1[i]);
          for (let i in e2) result.add(e2[i]);
        }
        else if (e1.length <= n/2) {
          for (let i in e1) result.add(e1[i]);
          for (let i = e1.length; i < n; i++) result.add(Util.choose(e2));
        }
        else if (e2.length <= n/2) {
          for (let i in e2) result.add(e2[i]);
          for (let i = e2.length; i < n; i++) result.add(Util.choose(e1));
        }
        else {
          for (let i = 0; i < n/2; i++) result.add(Util.choose(e1));
          for (let i = n/2; i < n; i++) result.add(Util.choose(e2));
        }
        return result;
      },
      star: function(r) {
        let e = r.examples(n);
        let result = new Set();
        if (e.length == 0) return [''];
        for (let i = 0; i < n; i++) {
          let s = '';
          for (let j = 0; j < i; j++)
            s += Util.choose(e);
          result.add(s);
        }
        return result;
      }
    });
  }

  /** Simple DOM tree *********************************************************/

  // TODO: extract this to UI

  appendTo(dom) {
    function text(str) { dom.appendChild(document.createTextNode(str)); }
    function list(vals) {
      let ul = document.createElement('ul');
      for (let i in vals) {
        let li = document.createElement('li');
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
}

/** Concrete subclasses *******************************************************/

// See documentation at the top of the RE class.

class ε    extends RE { induct(v,t)  { return (v.ε    || v._).call(t); } }
class Nil  extends RE { induct(v,t)  { return (v.nil  || v._).call(t); } }
class Str  extends RE { induct(v,t)  { return (v.str  || v._).call(t, this.val); }
  constructor(val) { super(); this.val = val; }
}
class Cat  extends RE { induct(v,t)  { return (v.cat  || v._).call(t, this.r1, this.r2); }
  constructor(r1,r2) { super(); this.r1 = r1; this.r2 = r2; }
}
class Alt  extends RE { induct(v,t)  { return (v.alt  || v._).call(t, this.r1, this.r2); }
  constructor(r1,r2) { super(); this.r1 = r1; this.r2 = r2; }
}
class Star extends RE { induct(v,t)  { return (v.star || v._).call(target, this.r); }
  constructor(r) { super(); this.r = r; }
}

/** Pretty printing *********************************************************/

function parens(r,prec) {
  return r.induct({
    ε:   function() { return 'ε'; },
    nil: function() { return '∅'; },
    str: function(val) { switch(val) {
		case 'ε': case '∅': case '*': case '+': case '(': case ')':
			  return '\\' + val;
		default:  return '' + val;
	      };
       },
    star: function(r) {
      return prec < 1 ? '(' + parens(r,1) + '*)' : parens(r,1) + '*';
    },
    cat:  function(r1,r2) {
      return prec < 2 ? '(' + parens(r1,2) + parens(r2,2) + ')' : parens(r1,2) + parens(r2,2);
    },
    alt:  function(r1,r2) {
      return prec < 3 ? '(' + parens(r1,3) + '+' + parens(r2,3) + ')' : parens(r1,3) + '+' + parens(r2,3);
    }
  });
}

/** Parsing REs ***************************************************************/

/* 3 expr   = term   [+ term ...]
 * 2 term   = factor [factor factor ...]
 * 1 factor = base [*]
 * 0 base   = ( expr ) | a | ε | ∅
 */

RE.parse = function parse(str) {
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
    let term = parseTerm(tok);

    switch(tok.peek()) {
      case '+':
        tok.consume('+');
        return RE.alt(term,parseExpr(tok));
      default:
        return term;
    }
  }

  function parseTerm(tok) {
    let factor = parseFactor(tok);

    switch(tok.peek()) {
      case undefined:
      case ')':
      case '+':
      case '*': return factor;
      default:  return RE.cat(factor, parseTerm(tok));
    }
  }

  function parseFactor(tok) {
    let base = parseBase(tok);

    switch(tok.peek()) {
      case '*':
        tok.consume('*');
        return RE.star(base);
      default:
        return base;
    }
  }

  function parseBase(tok) {
    switch(tok.peek()) {
      case '(':
        tok.consume('(');
        let expr = parseExpr(tok);
        tok.consume(')');
        return expr;
      case 'ε':
        tok.consume('ε');
        return RE.ε();
      case '∅':
        tok.consume('∅');
        return RE.nil();
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
        let result = tok.peek();
        tok.consume(result);
        return RE.str(result);
    }
  }

  let tok = new Tokens(str);
  let result = parseExpr(tok);
  if (tok.peek() != undefined)
    throw 'illegal regular expression';
  return result;
}

