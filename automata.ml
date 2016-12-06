open Core.Std

(** Type declarations (see .mli) **********************************************)

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

module type ExtendedNFA = sig
  include NFA

  val delta_hat : t -> State.t  -> String.t -> State.Set.t
  val accepts   : t -> String.t -> bool
  val print_dot : t -> Format.formatter -> unit
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

module type ExtendedDFA = sig
  include DFA

  val delta_hat : t -> State.t -> String.t -> State.t
  val accepts  : t -> String.t -> bool
  val print_dot : t -> Format.formatter -> unit
end

(******************************************************************************)
(** Extensions ****************************************************************)
(******************************************************************************)

module ExtendNFA(NFA : NFA) = struct

  include NFA

  let delta_hat nfa q x = failwith "TODO"

  let accepts nfa x = failwith "TODO"

  let print_dot f nfa = failwith "TODO"

end

module DFAasNFA(DFA : DFA) = ExtendNFA(struct
  include DFA

  let delta nfa q a = match a with
    | Epsilon -> State.Set.empty
    | Char a  -> State.Set.singleton (DFA.delta nfa q a)

end)

module ExtendDFA(DFA : DFA) = struct
  include DFA
  module NFA = DFAasNFA(DFA)

  let delta_hat nfa q x = String.fold x ~init:q ~f:(delta nfa)

  let accepts nfa x = is_final nfa (delta_hat nfa (initial nfa) x)

  let print_dot f nfa = NFA.print_dot
end

module NFAasDFA(NFA : NFA) = struct
  module State = struct
    module T = struct
      type t = NFA.State.Set.t
    end

    include T
    include Comparable.Make(T)
  end

  type t = NFA.t

  (* convention: q is an nfa-state; s is a dfa-state (set of nfa-states) *)

  let closure m s =
    Set.fold s ~init:s ~f:begin fun acc q ->
      Util.dfs ~init:acc ~root:q ~children:(fun q -> NFA.delta m q Epsilon)
    end

  let alphabet m = NFA.alphabet m
  let initial  m = closure m (NFA.State.Set.singleton (NFA.initial m))
  let is_final dfa = Set.mem dfa.final

  let delta dfa q a =
    closure 

  let convert nfa = {
    nfa      = nfa;
    alphabet = NFA.alphabet nfa;
    final    = failwith "TODO";
    initial  = failwith "TODO";
  }

end


(*
** vim: ts=2 sw=2 et ai
*)
