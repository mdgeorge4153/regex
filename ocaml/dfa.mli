open Core.Std
open Automata

module Extend(DFA : DFA) : sig
  
end

module Determinize(NFA : NFA) : sig
  include DFA

  val convert : NFA.t -> t
end

module Minimize(Input : DFA) : sig
  include DFA

  val convert : Input.t -> t
end

module Canonicalize(Input : DFA) : sig
  include DFA

  val convert : Input.t -> t
  val eq : t -> t -> bool
end

(*
** vim: ts=2 sw=2 et ai
*)
