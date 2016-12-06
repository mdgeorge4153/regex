open Core.Std

let dfs ~init ~root ~children =
  let rec visit node seen =
    if Set.mem seen node then seen else
    Set.fold (children node) ~init:(Set.add seen node) ~f:visit
  in visit root init

(*
** vim: ts=2 sw=2 et ai
*)
