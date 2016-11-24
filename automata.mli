open Core.Std

type transition = Char of char | Epsilon

module type NFA = sig
	type t
	module State : sig
		type t
		include Comparable.S with type t := t
	end

	val states   : t -> State.Set.t
	val alphabet : t -> Char.Set.t
	val delta    : t -> State.t -> transition -> State.Set.t
	val initial  : t -> State.t
	val final    : t -> State.t -> bool
end

module type DFA = sig
  type t
  module State : sig
  	type t
  	include Comparable.S with type t := t
  end
  
  val states   : t -> State.Set.t
  val alphabet : t -> Char.Set.t
  val delta    : t -> State.t -> transition -> State.t
  val initial  : t -> State.t
  val final    : t -> State.t -> bool
end


