type t

include Automata.NFA
  with type t     := t

(** output an NFA in the dot format on the given formatter *)
val print_nfa : Format.formatter -> t -> unit

(** output an NFA in the given file *)
val write_nfa : t -> string -> unit

(** convert a reg. exp. to an nfa *)
val of_re : RE.t -> t

