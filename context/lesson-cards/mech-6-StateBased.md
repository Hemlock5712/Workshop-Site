## Steps

1. Open `TeleopOpMode.java`. The bindings from mech-2 are gone and a
   `StateMachine` has replaced them.
2. Find the states and read one command per state.
3. Read the transitions. `stowed.switchTo(pickup).when(driver.leftTrigger())`
   is a sentence, and it reads as one.
4. Find `sm.switchFromAny().to(stowed).when(driver.b())`.

## Check yourself

The machine cancels the old state's command when it leaves. Nothing in this
file cancels anything by hand, and that is the difference from mech-2, where
every `onTrue` needed a matching `onFalse` to take the hold away.

`switchFromAny().to(stowed)` on the B button is the panic button. Whatever the
superstructure is doing, one press packs it up. Work out why that is worth a
line of its own rather than a transition from each state in turn.

`onEnter` and `onExit` on `ready` write a log line. They run on the way in and
the way out without touching the command the state owns, which is what keeps
the state's own job readable.

## Watch out

A `StateMachine` is itself a `Command`, so it gets scheduled like any other.
That is why the field is called `machine` and why nothing special happens to
it. If that sounds strange, it is the same idea as `runFast()` returning a
command rather than doing the work.
