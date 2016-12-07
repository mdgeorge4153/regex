module Automata.NFA where
  class Set stateSet state => Machine machine stateSet state where
    states   :: machine -> stateSet
    alphabet :: machine -> [Char]

    -- | δ :: states m -> alphabet m -> {states m}
    delta    :: machine -> state -> Char -> stateSet

    -- | start m ∈ states m
    start    :: machine -> state

    -- | final m ⊆ states m
    final    :: machine -> stateSet

