
/**
 * Q: a FiniteSet of states
 * Σ: a FiniteSet of characters
 * δ: Q × Σ → FiniteSets of states
 * ε: Q → FiniteSets of states
 * q0: a state
 * A:  a FiniteSet of states
 */

export default class εNFA {

  constructor(spec) {
    this.Q  = spec.Q;
    this.Σ  = spec.Σ;
    this.δ  = spec.δ;
    this.ε  = spec.ε;
    this.q0 = spec.q0;
    this.A  = spec.A;
  }

  εclose(q) {
    return new FiniteSet([q],this.Q.equality).transitiveClosure(this.ε);
  }

  δhat(q, x) {
    let m = this;
    return induct(x, {
      ε: ()     => m.εclose(q),
      xa: (x,a) =>
    });
  }
}

let export ofRE(r,Σ) {
  let start = new Symbol('(' + re.toString() + ').start');
  let end   = new Symbol('(' + re.toString() + ').end');

  let empty = new FiniteSet([], FiniteSet.primitive);

  return r.induct({

    ε:  () => new εNFA({
        Q: new FiniteSet([start], FiniteSet.primitive);
        Σ: Σ,
        δ: (q, a) => empty,
        ε: (q)    => empty,
        q0: start,
        A:  new FiniteSet([start], FiniteSet.primitive)
     }),

    nil: () => new εNFA({
        Q: new FiniteSet([start], FiniteSet.primitive);
        Σ: Σ,
        δ: (q, a) => empty,
        ε: (q)    => empty,
        q0: start,
        A:  empty
      }),

    str: (val) => new εNFA({
        Q: new FiniteSet([start,end], FiniteSet.primitive),
        Σ: Σ,
        δ: (q, a) => Σ.equality(a, val) && q == start ? new FiniteSet([end], FiniteSet.primitive)
                                                      : empty,
        q0: start,
        A:  new FiniteSet([end], FiniteSet.primitive)
      }),

    alt(r1, r2) {
      let n1 = ofRE(r1), n2 = ofRE(r2);
      return new εNFA({
        Q: n1.Q.union(n2.Q).union(new FiniteSet([start], FiniteSet.primitive)),
        Σ: Σ,
        δ(q, a) {
          let δ1 = n1.Q.contains(q) ? n1.δ(q,a) : empty;
          let δ2 = n2.Q.contains(q) ? n2.δ(q,a) : empty;

          return δ1.union(δ2);
        },
        ε(q) {
          let ε1 = n1.Q.contains(q) ? n1.ε(q) : empty;
          let ε2 = n2.Q.contains(q) ? n2.ε(q) : empty;
          let ε3 = q == start       ? new FiniteSet([n1.q0, n2.q0]) : empty;

          return ε1.union(ε2).union(ε3);
        },
        q0: start
        A: n1.A.union(n2.A)
      });
    }

    cat(r1,r2) {
      let n1 = ofRE(r1), n2 = ofRE(r2);
      return new εNFA({
        Q: n1.Q.union(n2.Q),
        Σ: Σ,
        δ(q, a) {
          let δ1 = n1.Q.contains(q) ? n1.δ(q,a) : empty;
          let δ2 = n2.Q.contains(q) ? n2.δ(q,a) : empty;

          return δ1.union(δ2);
        },
        ε(q) {
          let ε1 = n1.Q.contains(q) ? n1.ε(q) : empty;
          let ε2 = n2.Q.contains(q) ? n2.ε(q) : empty;
          let ε3 = n1.A.contains(q) ? new FiniteSet([n2.q0], FiniteSet.primitive) : empty;

          return ε1.union(ε2).union(ε3);
        }
        q0: n1.q0,
        A: n2.A
      });
    }

    star(r) {
      let n = ofRE(r);
      return new εNFA({
        Q: n.Q.union(new FiniteSet([start], FiniteSet.primitive)),
        Σ: Σ,
        δ: (q,a) => n.Q.contains(q) ? n.δ(q,a) : empty,
        ε(q) {
          let ε1 = n.Q.contains(q) ? n.ε(q) : empty;
          let ε2 = n.A.contains(q) ? new FiniteSet([start], FiniteSet.primitive) : empty;
          let ε3 = q == start      ? new FiniteSet([n.q0],  FiniteSet.primitive) : empty;
          return ε1.union(ε2).union(ε3);
        },
        q0: start,
        A: new FiniteSet([start], FiniteSet.primitive)
      });
    }
  });
}

