export function union(a,b) {
  var result = new Set(a);
  for (var x of b)
    result.add(x);
  return result;
}

export function remove(s,x) {
  var result = new Set(s);
  result.delete(x);
  return result;
}

export function choose(e) {
  e = [...e];
  return e[Math.floor(Math.random()*e.length)];
}

