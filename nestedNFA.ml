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

type transition = [`Epsilon | `Char of char]

type t = {
    name        : string;
    alphabet    : Char.Set.t;
    newstates   : int;
    newtrans    : ((State.t * transition) * State.t) list;
    subgraphs   : t list;
    final       : State.t;
    initial     : State.t;
}

let wrap i qs = List.map qs (fun s -> SubState (i,s))

(**************************************)
(** NFA functions *********************)
(**************************************)

let rec states nfa =
  let newstates = List.init nfa.newstates (fun i -> NewState i) in
  let oldstates = List.concat_mapi nfa.subgraphs begin fun i n ->
    wrap i (states n)
  end in
  newstates@oldstates

let alphabet {alphabet} = alphabet
let initial  {initial}  = initial

let final    {final} s  = (s = final)

let rec delta nfa q a =
  let newtrans = List.filter_map nfa.newtrans begin fun (s,q') ->
    if s = (q,a) then Some q' else None
  end in

  match q with
    | NewState _     -> newtrans
    | SubState (i,q) -> newtrans@(wrap i (delta (List.nth_exn nfa.subgraphs i) q a))

(**************************************)
(** Printing **************************)
(**************************************)

let rec print_state f = function
  | NewState i     -> Format.fprintf f "%i" i
  | SubState (i,q) -> Format.fprintf f "%i%a" i print_state q

let print_trans f = function
  | `Char c  -> Format.fprintf f "%c" c
  | `Epsilon -> Format.fprintf f "ε"

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

let write nfa filename =
  let output = open_out filename in
  Format.fprintf (Format.formatter_of_out_channel output) "%a@." print_nfa nfa;
  close_out output;
  ()

(******************************************************************************)
(** RE -> NFA conversion ******************************************************)
(******************************************************************************)

let rec of_re re =
  let open RE in
  match re with
    | EmptySet     -> { name        = string_of_re re
                      ; alphabet    = []
                      ; newstates   = 2
                      ; subgraphs   = [| |]
                      ; transitions = []
                      ; initial     = NewNode 0
                      ; final       = NewNode 1
                      }
    | EmptyString  -> { name        = string_of_re re
                      ; alphabet    = []
                      ; newstates   = 1
                      ; subgraphs   = [| |]
                      ; transitions = []
                      ; initial     = NewNode 0
                      ; final       = NewNode 0
                      }
    | Char c       -> { name        = string_of_re re
                      ; alphabet    = [c]
                      ; newstates   = 2
                      ; subgraphs   = [| |]
                      ; transitions = [(NewNode 0, TChar c), NewNode 1]
                      ; initial     = NewNode 0
                      ; final       = NewNode 1
                      }
    | Concat (r1,r2) -> let nfa1 = nfa_of_re r1 in
                      let nfa2 = nfa_of_re r2 in
                      { name        = string_of_re re
                      ; alphabet    = Char.Set.singleton c
                      ; newstates   = 0
                      ; subgraphs   = [| nfa1; nfa2 |]
                      ; transitions = [(Subgraph 0, TEpsilon), Subgraph 1]
                      ; initial     = Subgraph 0
                      ; final       = Subgraph 1
                      }
    | Alternate (r1,r2) -> let nfa1 = nfa_of_re r1 in
                      let nfa2 = nfa_of_re r2 in
                      { name        = string_of_re re
                      ; newstates   = 2
                      ; subgraphs   = [| nfa1; nfa2 |]
                      ; transitions = [(NewNode 0, TEpsilon), Subgraph 0
                                      ;(NewNode 0, TEpsilon), Subgraph 1
                                      ;(Subgraph 0, TEpsilon), NewNode 1
                                      ;(Subgraph 1, TEpsilon), NewNode 1
                                      ]
                      ; initial     = NewNode 0
                      ; final       = NewNode 1
                      }
    | Closure r    -> let nfa = nfa_of_re r in
                      { name        = string_of_re re
                      ; newstates   = 1
                      ; subgraphs   = [| nfa |]
                      ; transitions = [(Subgraph 0, TEpsilon), NewNode 0
                                      ;(NewNode  0, TEpsilon), Subgraph 0
                                      ]
                      ; initial     = NewNode 0
                      ; final       = NewNode 0
                      }

let flatten nfa =
  failwith "TODO"


(*
** vim: ts=2 sw=2 et ai
*)
