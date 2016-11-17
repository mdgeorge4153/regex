
(******************************************************************************)
(** Regular exprs *************************************************************)
(******************************************************************************)

type re =
    | EmptySet | EmptyString | Char of char
    | Concat of re * re | Alternate of re * re | Closure of re

let string_of_re re =
  (** returns string and precedence *)
  let rec helper re = match re with
    | EmptySet        -> "∅", 0
    | EmptyString     -> "ε", 0
    | Char c          -> Char.escaped c, 0
    | Closure re'     -> let (s,prec) = helper re' in
                         (if prec > 1 then ("("^s^")") else s)
                         ^"*"
                         , 1
    | Concat (r1,r2)  -> let (s1,p1) = helper r1 in
                         let (s2,p2) = helper r2 in
                         (if p1 > 2 then "("^s1^")" else s1)
                         ^
                         (if p2 > 2 then "("^s2^")" else s2)
                         , 2
    | Alternate (r1,r2) -> let (s1,p1) = helper r1 in
                         let (s2,p2) = helper r2 in
                         s1^"+"^s2, 3
  in fst (helper re)

(*
3 expr   = term [+ term ...]
2 term   = factor [factor factor factor ...]
1 factor = base [*]
0 base   = ( expr ) | c | e | E
*)

let (>>=) o f = match o with
  | None -> None
  | Some x -> f x

let return x = Some x

let fail = None

let rec parse_expr chars =
  parse_term chars >>= fun (term, rest) ->
  match rest with
    | '+'::tl -> parse_expr tl >>= fun (term', rest') ->
                 return (Alternate (term, term'), rest')
    | _       -> return (term, rest)

and parse_term chars =
  parse_factor chars >>= fun (factor, rest) ->
  match rest with
    | []   -> return (factor, [])
    | ')'::_ | '+'::_ | '*'::_
           -> return (factor, rest)
    | rest -> parse_term rest >>= fun (term, rest') ->
              return (Concat (factor, term), rest')

and parse_factor chars =
  parse_base chars >>= fun (base, rest) ->
  match rest with
    | '*'::rest' -> return (Closure(base), rest')
    | rest'      -> return (base, rest')

and parse_base chars =
  match chars with
    | '('::rest -> parse_expr rest >>= fun (expr, rest') ->
                   begin match rest' with
                     | ')'::rest'' -> return (expr, rest'')
                     | _           -> fail
                   end
    | 'e'::rest -> return (EmptyString, rest)
    | 'E'::rest -> return (EmptySet, rest)
    | []  -> fail
    | ')'::_ -> fail
    | '+'::_ -> fail
    | '*'::_ -> fail
    | c::rest   -> return (Char c, rest)

let explode s =
  let rec exp i l =
    if i < 0 then l else exp (i - 1) (s.[i] :: l) in
  exp (String.length s - 1) []

let parse_re s =
  parse_expr (explode s) >>= function
    | re,[] -> return re
    | _     -> fail

(******************************************************************************)
(** NFAs **********************************************************************)
(******************************************************************************)


type node = NewNode of int | Subgraph of int
type transition = TEpsilon | TChar of char

(** we consider only machines with a single final state *)
type nfa = {
    name        : string;
    newstates   : int;
    subgraphs   : nfa array;
    transitions : ((node * transition) * node) list;
    final       : node;
    initial     : node;
}

(**************************************)
(** Printing **************************)
(**************************************)

let rec name getnode nfa prefix node = match node with
  | NewNode i  -> prefix ^ (string_of_int i)
  | Subgraph i -> let sub = nfa.subgraphs.(i) in
                  name getnode sub (prefix^(string_of_int i)) (getnode sub)

let start_name = name (fun sub -> sub.initial)
let final_name = name (fun sub -> sub.final)

let append path i = path^(string_of_int i)

let str_of_trans = function | TChar c -> Char.escaped c | TEpsilon -> "ε"

let print_nfa f nfa =
  let rec helper path nfa =
    Format.fprintf f "subgraph cluster%s {@," path;
    Format.fprintf f "  @[<v>label = \"%s\";@,@," nfa.name;

    for i = 0 to nfa.newstates - 1 do
      Format.fprintf f "%s%i;@ " path i
    done;

    Array.iteri (fun i nfa -> helper (path^(string_of_int i)) nfa) nfa.subgraphs;

    List.iter begin fun ((src, c),dst) ->
      Format.fprintf f "%s -> %s [label=\"%s\"];@," (final_name nfa path src)
                                                    (start_name nfa path dst)
                                                    (str_of_trans c)
    end nfa.transitions;
    Format.fprintf f "@]@,};@,@,";
  in
  Format.fprintf f "digraph nfa {@,";
  Format.fprintf f "  @[<v>rankdir=\"LR\";@,";
  Format.fprintf f   "labeljust=\"l\";@,";
  Format.fprintf f   "node [label=\"\"];@,";
  Format.fprintf f   "@,";
  helper "" nfa;
  Format.fprintf f   "%s [peripheries=2];@," (start_name nfa "" nfa.final);
  Format.fprintf f   "%s [label=\"start\"];@," (final_name nfa "" nfa.initial);
  Format.fprintf f   "@]@,";
  Format.fprintf f "}";
  ()

let write nfa filename =
  let output = open_out filename in
  Format.fprintf (Format.formatter_of_out_channel output) "%a@." print_nfa nfa;
  close_out output;
  ()

(**************************************)
(** Flatten ***************************)
(**************************************)

let flatten nfa =

  (** given [nfa], produce a shifted, flattened nfa'.
   ** the nodes of nfa' are [offset...offset+nfa'.newstates)
   ** all referenced nodes are NewNode i where i is in that range.
   **)
  let rec flatten nfa offset =
    let (totalstates, subgraphs) = Array.fold_right begin fun subgraph (offset, subs) ->
      let subgraph = flatten subgraph offset in
      (offset + subgraph.newstates, subgraph::subs)
    end nfa.subgraphs (offset + nfa.newstates, []) in

    let initial = function
      | NewNode  i -> NewNode (i + offset)
      | Subgraph i -> (List.nth subgraphs i).initial
    in

    let final = function
      | NewNode  i -> NewNode (i + offset)
      | Subgraph i -> (List.nth subgraphs i).final
    in

    let newtransitions = List.map begin fun ((src,c),dst) ->
      (final src,c), initial dst
    end nfa.transitions in

    let transitions = List.fold_left begin fun acc g ->
      g.transitions @ acc
    end newtransitions subgraphs in

    { name        = nfa.name
    ; newstates   = totalstates - offset
    ; subgraphs   = [| |]
    ; transitions = transitions
    ; final       = final (nfa.final)
    ; initial     = initial (nfa.initial)
    }
  in
  flatten nfa 0

(******************************************************************************)
(** RE -> NFA conversion ******************************************************)
(******************************************************************************)

let rec nfa_of_re re = match re with
    | EmptySet     -> { name        = string_of_re re
                      ; newstates   = 2
                      ; subgraphs   = [| |]
                      ; transitions = []
                      ; initial     = NewNode 0
                      ; final       = NewNode 1
                      }
    | EmptyString  -> { name        = string_of_re re
                      ; newstates   = 1
                      ; subgraphs   = [| |]
                      ; transitions = []
                      ; initial     = NewNode 0
                      ; final       = NewNode 0
                      }
    | Char c       -> { name        = string_of_re re
                      ; newstates   = 2
                      ; subgraphs   = [| |]
                      ; transitions = [(NewNode 0, TChar c), NewNode 1]
                      ; initial     = NewNode 0
                      ; final       = NewNode 1
                      }
    | Concat (r1,r2) -> let nfa1 = nfa_of_re r1 in
                      let nfa2 = nfa_of_re r2 in
                      { name        = string_of_re re
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


(******************************************************************************)
(** Testing *******************************************************************)
(******************************************************************************)

let Some re = parse_re "ab+(e+d)*";;
let nfa = nfa_of_re re;;

