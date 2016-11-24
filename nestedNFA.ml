open Core.Std

module State = struct
  module T = struct
    type t = NewState of int | SubState of int * t
      [@@deriving compare,sexp]
  end
  include T
  include Comparable.Make(T)
end

open State.T


type t = {
    name        : string;
    alphabet    : Char.Set.t;
    newstates   : int;
    newtrans    : ((State.t * NFA.transition) * State.t) list;
    subgraphs   : t list;
    final       : State.t;
    initial     : State.t;
}

let wrap i qs = State.Set.map qs (fun s -> SubState (i,s))

(**************************************)
(** NFA functions *********************)
(**************************************)

let rec states nfa =
  let newstates = List.init nfa.newstates (fun i -> State.Set.singleton (NewState i)) in
  let oldstates : State.Set.t list = List.mapi nfa.subgraphs ~f:begin fun i n ->
    wrap i (states n)
  end in
  State.Set.union_list (newstates@oldstates)

let alphabet {alphabet} = alphabet
let initial  {initial}  = initial

let final    {final} s  = (s = final)

let rec delta nfa q a =
  let newstates = List.map nfa.newtrans begin fun (s,q') ->
    if s = (q,a) then State.Set.singleton q' else State.Set.empty
  end in

  let oldstates = match q with
    | NewState _     -> State.Set.empty
    | SubState (i,q) -> wrap i (delta (List.nth_exn nfa.subgraphs i) q a)
  in

  List.fold newstates ~init:oldstates ~f:Set.union

(**************************************)
(** Printing **************************)
(**************************************)

let rec print_state f = function
  | NewState i     -> Format.fprintf f "%i" i
  | SubState (i,q) -> Format.fprintf f "%i%a" i print_state q

let print_trans f = function
  | NFA.Char c  -> Format.fprintf f "%c" c
  | NFA.Epsilon -> Format.fprintf f "ε"

let print_nfa f nfa =
  let rec helper path nfa =
    Format.fprintf f "subgraph cluster%s {@," path;
    Format.fprintf f "  @[<v>label = \"%s\";@,@," nfa.name;

    for i = 0 to nfa.newstates - 1 do
      Format.fprintf f "%s%i;@ " path i
    done;

    List.iteri ~f:(fun i nfa -> helper (path^(string_of_int i)) nfa) nfa.subgraphs;

    List.iter nfa.newtrans begin fun ((src, c),dst) ->
      Format.fprintf f "%s%a -> %s%a [label=\"%a\"];@,"
                       path print_state src
                       path print_state dst
                       print_trans c
    end;
    Format.fprintf f "@]@,};@,@,";
  in
  Format.fprintf f "digraph nfa {@,";
  Format.fprintf f "  @[<v>rankdir=\"LR\";@,";
  Format.fprintf f   "labeljust=\"l\";@,";
  Format.fprintf f   "node [label=\"\"];@,";
  Format.fprintf f   "@,";
  helper "" nfa;
  Format.fprintf f   "%a [peripheries=2];@,"   print_state nfa.final;
  Format.fprintf f   "%a [label=\"start\"];@," print_state nfa.initial;
  Format.fprintf f   "@]@,";
  Format.fprintf f "}";
  ()

let write_nfa nfa filename =
  let output = open_out filename in
  Format.fprintf (Format.formatter_of_out_channel output) "%a@." print_nfa nfa;
  close_out output;
  ()

(******************************************************************************)
(** RE -> NFA conversion ******************************************************)
(******************************************************************************)

let rec of_re re =
  let open RE in

  let init  nfas i = SubState (i,(List.nth_exn nfas i).initial) in
  let final nfas i = SubState (i,(List.nth_exn nfas i).final)   in

  (* the union of the alphabets of the nfas in the given list *)
  let alpha nfas   = List.fold nfas ~init:Char.Set.empty ~f:begin fun a n ->
    Set.union n.alphabet a
  end in

  match re with
    | EmptySet     -> { name        = RE.to_string re
                      ; alphabet    = Char.Set.empty
                      ; newstates   = 2
                      ; subgraphs   = []
                      ; newtrans    = []
                      ; initial     = NewState 0
                      ; final       = NewState 1
                      }
    | EmptyString  -> { name        = RE.to_string re
                      ; alphabet    = Char.Set.empty
                      ; newstates   = 1
                      ; subgraphs   = []
                      ; newtrans    = []
                      ; initial     = NewState 0
                      ; final       = NewState 0
                      }
    | Char c       -> { name        = RE.to_string re
                      ; alphabet    = Char.Set.singleton c
                      ; newstates   = 2
                      ; subgraphs   = []
                      ; newtrans    = [(NewState 0, NFA.Char c), NewState 1]
                      ; initial     = NewState 0
                      ; final       = NewState 1
                      }
    | Concat (r0,r1) -> let nfas = List.map ~f:of_re [r0;r1] in
                      { name        = RE.to_string re
                      ; alphabet    = alpha nfas
                      ; newstates   = 0
                      ; subgraphs   = nfas
                      ; newtrans    = [(final nfas 0, NFA.Epsilon), init nfas 1]
                      ; initial     = init  nfas 0
                      ; final       = final nfas 1
                      }
    | Alternate (r0,r1) -> let nfas = List.map ~f:of_re [r0;r1] in
                      { name        = RE.to_string re
                      ; alphabet    = alpha nfas
                      ; newstates   = 2
                      ; subgraphs   = nfas
                      ; newtrans    = [(NewState 0, NFA.Epsilon), init nfas 0
                                      ;(NewState 0, NFA.Epsilon), init nfas 1
                                      ;(final nfas 0, NFA.Epsilon), NewState 1
                                      ;(final nfas 1, NFA.Epsilon), NewState 1
                                      ]
                      ; initial     = NewState 0
                      ; final       = NewState 1
                      }
    | Closure r    -> let nfas = [of_re r] in
                      { name        = RE.to_string re
                      ; alphabet    = alpha nfas
                      ; newstates   = 1
                      ; subgraphs   = nfas
                      ; newtrans    = [(final nfas 0, NFA.Epsilon), NewState 0
                                      ;(NewState  0, NFA.Epsilon), init nfas 0
                                      ]
                      ; initial     = NewState 0
                      ; final       = NewState 0
                      }

let flatten nfa =
  failwith "TODO"


(*
** vim: ts=2 sw=2 et ai
*)
