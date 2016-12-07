module Regex where

import Text.ParserCombinators.Parsec

{-- REs -----------------------------------------------------------------------}

data Regexp = EmptySet
	    | EmptyString
	    | Char Char
	    | Concat    Regexp Regexp
	    | Alternate Regexp Regexp
	    | Closure   Regexp

{-- Parsing REs ---------------------------------------------------------------}

regex :: GenParser Char st Regexp
regex = foldl1 Alternate <$> sepBy term (char '+') 

term :: GenParser Char st Regexp
term = foldl1 Concat <$> many factor

factor :: GenParser Char st Regexp
factor = do b <- base; (char '*' >> return (Closure b))
		   <|> return b

base :: GenParser Char st Regexp
base = do (do  char '('; r <- regex; char ')'; return r)
      <|> (Char <$> noneOf "(+*ε∅)")
      <|> (char 'ε' >> return EmptyString)
      <|> (char '∅' >> return EmptySet)

parseRE :: String -> Either ParseError Regexp
parseRE = parse regex "(unknown)"

instance Read Regexp where
  readsPrec _ = either (const []) id . parse' regex "" where
    parse' = do
      a    <- parseRE
      rest <- getInput
      return [(a,rest)]

{-- Pretty printing REs -------------------------------------------------------}

instance Show Regexp where
  show re = fst $ helper re
   where helper EmptySet          = ("∅", 0)
	 helper EmptyString       = ("ε", 0)
	 helper (Char c)          = ([c], 0)
	 helper (Concat r1 r2)    = (parenthesize 2 (helper r1)
				  ++ parenthesize 2 (helper r2), 2)
	 helper (Alternate r1 r2) = (parenthesize 3 (helper r1)
				  ++ "+"
				  ++ parenthesize 3 (helper r2), 3)
	 helper (Closure r)       = (parenthesize 1 (helper r) ++ "*", 1)
  
	 parenthesize n (s,p) = if p > n then "("++s++")" else s

