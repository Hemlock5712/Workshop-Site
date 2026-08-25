## Steps

1. Open `RaiseAndShootOpMode.java` and read the routine top to bottom. It is
   written as a sequence of ordinary statements.
2. Find both verbs. `coroutine.fork(...)` starts something and moves on.
   `coroutine.await(...)` stops and waits.
3. Note which one wraps `arm.vertical()` and ask why.
4. Note the `withTimeout(Seconds.of(3.0))` on both waits.

## Check yourself

`vertical()` is a hold and never finishes, so `await` on it would wait forever.
`fork` starts it and keeps going, and the hold stays running while the next
step happens. That is the whole reason both verbs exist.

Then look at what is not written: nothing cancels the two forked holds at the
end. Ending the routine does it. If you can say why the arm does not stay
pinned vertical after the routine finishes, you have understood coroutines.

Every wait has a timeout. In an autonomous a stuck arm without one freezes the
rest of the match, and the three seconds here are a placeholder for a number
you time on your own mechanism.

## Watch out

Read this as a sequence, not as a chain of composed commands. That is the
point: a coroutine lets you write a routine the way you would describe it out
loud. `/chaining-commands` shows the composition style for comparison.
