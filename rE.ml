open Core.Std

type t =
    | EmptySet | EmptyString | Char of char
    | Concat of t * t | Alternate of t * t | Closure of t

let to_string re =
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

let rec alphabet = function
  | EmptySet | EmptyString -> Char.Set.empty
  | Char c -> Char.Set.singleton c
  | Concat (r1,r2) | Alternate (r1,r2) -> Set.union (alphabet r1) (alphabet r2)
  | Closure r -> alphabet r

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

let of_string s =
  parse_expr (explode s) >>= function
    | re,[] -> return re
    | _     -> fail


(*
** vim: ts=2 sw=2 et ai
*)
