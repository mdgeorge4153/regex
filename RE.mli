open Core.Std

(******************************************************************************)
(** Regular exprs *************************************************************)
(******************************************************************************)

type t =
    | EmptySet | EmptyString | Char of char
    | Concat of t * t | Alternate of t * t | Closure of t

val to_string     : t -> string
val of_string     : string -> t option
val of_string_exn : string -> t
val alphabet      : t -> Char.Set.t

