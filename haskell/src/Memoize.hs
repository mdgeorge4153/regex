
data MemoEntry a = Done a | Started | Unvisited

-- | memoizeGreaterFix default f gives a fixed point of f that
--   extends [default].
memoizeGreaterFix :: (a -> b) -> ((a -> b) -> (a -> b)) -> (a -> b)

memoizeGreaterFix d f = 
  

