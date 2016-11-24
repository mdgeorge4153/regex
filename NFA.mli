open Core.Std

module type S = sig
  type t
  module State : sig
    type t
    include Comparable.S with type t := t
  end

  val states   : t -> State.t list
  val alphabet : t -> Char.Set.t
  val delta    : t -> State.t -> [`Char of char | `Epsilon] -> State.Set.t
  val initial  : t -> State.t
  val final    : t -> State.t -> bool
end



(*
** vim: ts=2 sw=2 et ai
*)
