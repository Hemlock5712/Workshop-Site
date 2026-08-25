## Steps

1. Open `src/Main.java` and press the Run button above `main`.
2. Read the output against the source. The lines do not print in source order.
3. Open `src/Arm.java`. Find the four parts in this order: fields, constructor,
   methods, and a method that returns a `Runnable`.
4. Change `FAST_VOLTAGE` to `6.0` and run again.

## Check yourself

The output should be:

```
1. before the Arm exists
Arm created. Motor is at rest.
2. asking for the runFast code
3. the arm has not moved yet
4. now running it
arm -> 3.0 V
arm -> 3.0 V
arm -> 0.0 V
5. done
```

Line 3 is the one that matters. `arm.runFast()` was called before it printed,
and no voltage reached the motor. A method that returns a `Runnable` hands back
code that has not run. Something has to call `.run()`.

On the robot, `runFast()` returns a `Command` instead of a `Runnable`, and the
scheduler is what calls it. That is the only difference. If you can say why
nothing moved between lines 2 and 4, you can read `Arm.java` on
`mech-2-Commands`.

## Watch out

`SLOW_VOLTAGE` and `FAST_VOLTAGE` are `static final`. `static` means there is
one copy shared by every `Arm`, not one per arm. Build two arms and they still
share those two numbers. `motor` has no `static`, so each arm gets its own.
