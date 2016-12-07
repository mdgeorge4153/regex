{-# LANGUAGE MultiParamTypeClasses  #-}
{-# LANGUAGE TypeSynonymInstances   #-}
{-# LANGUAGE FlexibleInstances      #-}
{-# LANGUAGE FunctionalDependencies #-}

module Automata.DFA where

import qualified Data.Set as Set
import qualified Data.Ix  as Ix
import Data.Array (Array,(!),array)

type Set = Set.Set

class (Ord state,Ord char) => Machine machine state char | machine -> state char where
  states   :: machine -> Set state
  alphabet :: machine -> Set char

  -- | transition function δ :: states m -> alphabet m -> states m
  delta :: machine -> state -> char -> state

  -- | start m ∈ states m
  start    :: machine -> state

  -- | final m ⊆ states m
  final    :: machine -> Set state


-- | the extended transition function
deltaHat :: (Machine machine state char) =>
            machine -> state -> [char] -> state
deltaHat m = foldl (delta m)


-- | true if the machine accepts the given input
accepts :: (Machine machine state char) =>
           machine -> [char] -> Bool
accepts m x = deltaHat m (start m) x `Set.member` (final m)


{-- minimizing DFA ------------------------------------------------------------}

type State   = Int
type CharInd = Int

-- | states are numbered [0 .. max_state)
--   characters are identified by their index in char_set
data CompactDFA char = CompactDFA { max_state   :: State
                                  , char_set    :: Set char
                                  , transitions :: Array (State,CharInd) State
                                  , start_state :: State
                                  , final_state :: Set State
                                  }

instance Ord char => Machine (CompactDFA char) State char where
  states m    = Set.fromList $ Ix.range (0, max_state m)
  delta m q a = transitions m ! (q,index a)
                where index a = Set.findIndex a (char_set m)

  alphabet    = char_set
  start       = start_state
  final       = final_state

compactify :: (Machine machine state char) =>
              machine -> CompactDFA char
compactify m = CompactDFA {
    max_state   = n_states - 1,
    char_set    = alphabet m,
    transitions = array bounds [(source,delta' source) | source <- Ix.range bounds],
    start_state = stateNum (start m),
    final_state = Set.map stateNum (final m)
  }
  where n_states       = Set.size (states m)
        n_chars        = Set.size (alphabet m)
        bounds         = ((0,0),(n_states - 1,n_chars - 1))
        stateNum q     = Set.findIndex q (states m)
        stateAt i      = Set.elemAt i (states m)
        charAt  a      = Set.elemAt a (alphabet m)
        delta' (qi,ai) = stateNum $ delta m (stateAt qi) (charAt ai)


