## Steps

1. Open `Arm.java` and find the three new methods: `getPosition`,
   `getTargetPosition` and `isAtTarget`.
2. Read `isAtTarget`. It is one line, and it compares where the arm is against
   where it was told to go, within a tolerance.
3. Find the same three on `Flywheel.java`, in speed rather than angle.
4. Look at the commented line in `Arm.java`:
   `arm.vertical().until(arm::isAtTarget)`.

## Check yourself

Until now every command was a hold that never finished. This module is what
gives a hold an ending. `until(arm::isAtTarget)` takes a command that runs
forever and stops it the moment the arm arrives.

The tolerance is the part worth arguing about. Too tight and `isAtTarget` never
returns true, so the command never ends and the routine hangs. Too loose and it
returns true while the arm is still visibly moving. There is no correct value
in the abstract; there is one for your mechanism.

`arm::isAtTarget` is a method reference. It hands over the method itself, not
the answer, so the scheduler can ask again on every loop.

## Watch out

This module has no lesson page yet, and four pages depend on it.
`/finish-lines`, `/coroutines`, `/state-based` and `/chaining-commands` all
lean on `isAtTarget`, and this is the only place it is defined.
