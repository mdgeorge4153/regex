open Core.Std

type transition = Char of char | Epsilon

module type NFA = sig
	type t
	module State : sig
		type t
		include Comparable.S with type t := t
	end

	val alphabet : t -> Char.Set.t
	val delta    : t -> State.t -> transition -> State.Set.t
	val initial  : t -> State.t
	val is_final : t -> State.t -> bool
end

module type DFA = sig
  type t
  module State : sig
    type t
    include Comparable.S with type t := t
  end
  
  val alphabet : t -> Char.Set.t
  val delta    : t -> State.t -> Char.t -> State.t
  val initial  : t -> State.t
  val is_final : t -> State.t -> bool
end

(** Extensions ****************************************************************)

module type ExtendedNFA = sig
  include NFA

  val delta_hat : t -> State.t  -> String.t -> State.Set.t
  val accepts   : t -> String.t -> bool
  val print_dot : t -> Format.formatter -> unit
end

module ExtendNFA(NFA : NFA) : ExtendedNFA
  with module State := NFA.State
   and type t := NFA.t

module type ExtendedDFA = sig
  include DFA

  val delta_hat : t -> State.t -> String.t -> State.t
  val accepts  : t -> String.t -> bool
  val print_dot : t -> Format.formatter -> unit
end

module ExtendDFA(DFA : DFA) : ExtendedDFA
  with module State := DFA.State
   and type t := DFA.t

(** Adapters ******************************************************************)

module DFAasNFA(DFA : DFA) : ExtendedNFA
  with type t := DFA.t
   and module State := DFA.State

module Determinize(NFA : NFA) : sig
  include ExtendedDFA
  val convert : NFA.t -> t
end

(*
** vim: ts=2 sw=2 et ai
*)
