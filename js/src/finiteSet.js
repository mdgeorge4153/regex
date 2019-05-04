export default class FiniteSet {

  constructor(elems, eq) {
    if (!eq)
      throw 'Sets require an equality operator';

    this.equality = eq;
    this._value   = [];

    for (let i of elems)
      if (!this._value.find(j => this.equality(i,j)))
        this._value.push(i);
  }

  static primitive(x,y) { return x === y; }

  toString() {
    return '{' + [...this].join(',') + '}';
  }

  [Symbol.iterator]() {
    return this._value[Symbol.iterator]();
  }

  isEmpty() {
    return this._value.length == 0;
  }

  subsetOf(other) {
    if (this.equality != other.equality)
      return false;

    return this._value.every(x => other.contains(x));
  }
  static subset(s1,s2) { return s1.subsetOf(s2); }

  equals(other) {
    return this.subsetOf(other) && other.subsetOf(this);
  }
  static equal(o1,o2) { return o1.equals(o2); }
 

  /**
   * f should be a function that takes an element and returns a set;
   * bigUnion returns the union of f(x) for every x in this.
   */
  bigUnion(f) {
    if (this.isEmpty()) return this;

    return this._value.map(f).reduce(FiniteSet.union);
  }

  /**
   * f should be a function that takes an element and returns a boolean;
   * Q.suchThat(f) returns { x ∈ Q | f(x) }
   */
  suchThat(f) {
    return new FiniteSet(this._value.filter(f), this.equality);
  }

  union(other) {
    if (this.equality != other.equality)
      throw 'cannot union sets with different types';
    return new FiniteSet([...this, ...other], this.equality);
  }
  static union(s1,s2) { return s1.union(s2); }

  intersect(other) {
    if (this.equality != other.equality)
      throw 'cannot intersect sets with different types';
    return this.suchThat(x => other.contains(x));
  }
  static intersect(s1,s2) { return s1.intersect(s2); }

  minus(other) {
    if (this.equality != other.equality)
      throw 'cannot subtract sets with different types';
    return this.suchThat(x => !other.contains(x));
  }
  static difference(s1,s2) { return s1.minus(s2); }

  differences(other) {
    return this.minus(other).union(other.minus(this));
  }
  static symmetricDifference(s1,s2) { return s1.differences(s2); }

  contains(x) {
    return (this._value.find(y => this.equality(x,y)) != undefined);
  }

  powerSet() {
    if (this.isEmpty())
      return new FiniteSet([new FiniteSet([],this.equality)],FiniteSet.equal);

    let x = new FiniteSet([this.choose()],this.equality);
    let withoutX = this.minus(x).powerSet();

    return withoutX.bigUnion(s => new FiniteSet([s, s.union(x)],FiniteSet.equal));
  }

  cross(other) {
    let result = []; 
    for (let i in this)
      for (let j in other)
        result.push([i,j]);

    let pairEq = ([a,b],[c,d]) => this.equality(a,c) && other.equality(b,d);
    return new FiniteSet(result, pairEq);
  }
  static cross(s1,s2) { return s1.cross(s2); }

  choose() {
    return this._value[0];
  }

}

