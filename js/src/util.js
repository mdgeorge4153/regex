define([],
function util() {

function union(a,b) {
  var result = new Set(a);
  for (var x of b)
    result.add(x);
  return result;
}

function remove(s,x) {
  var result = new Set(s);
  result.delete(x);
  return result;
}

function choose(e) {
  e = [...e];
  return e[Math.floor(Math.random()*e.length)];
}

var id = 0;

function unique(name) {
  return {id: id++, name: name, toString: function() { return 'unique ' + id + '(' + name + ')'; } };
}


return {union:union, choose:choose, unique:unique, remove:remove};

});

