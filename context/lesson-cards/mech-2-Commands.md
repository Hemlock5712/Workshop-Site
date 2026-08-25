## Steps

1. Open `Arm.java` and find the three methods that return a `Command`.
2. Note what every one of them ends with: `.named("... (hold)")` on a
   `runRepeatedly`. None of them ever finishes.
3. Open `TeleopOpMode.java`. Three bindings, made in the constructor, each
   pairing an `onTrue` with an `onFalse`.
4. Add a fourth binding of your own on `driver.b()`.

## Check yourself

`onTrue` and `onFalse` always come in pairs here, and the reason is the rule
above: a hold never ends on its own, so something has to take it away. Cover
the `onFalse` half of the right trigger binding and say what the flywheel does
when the driver lets go. It keeps spinning at full speed, forever.

The bindings are made in the OpMode constructor, not in `Robot`. That is what
makes them belong to this mode. Pick a different mode on the Driver Station and
the framework removes them for you. There is no cleanup code.

## Watch out

`runFast()` does not push any voltage. It returns a command that will push
voltage when the scheduler runs it. If that sentence is not yet obvious, the
`java-basics` module is the same idea with a `Runnable` and no robot in the
way.
