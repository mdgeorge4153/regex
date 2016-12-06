open Core.Std

val dfs :
  init:('node,'cmp) Set.t
  root:'node ->
  children:('node -> ('node,'a) Set) ->
  ('node,'cmp) Set.t

