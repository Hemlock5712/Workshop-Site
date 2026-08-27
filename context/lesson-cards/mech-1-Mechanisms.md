## Steps

1. Open `src/main/java/first/robot/mechanisms/Arm.java`. Read it top to bottom:
   fields, then a constructor, then two methods.
2. Open `Flywheel.java`. It is the same four parts with two motors instead of
   one.
3. Open `Robot.java` and find the two `public final` fields. That is where the
   mechanisms are created, once, for every OpMode to share.
4. Build the project from the Driver Station.

## Check yourself

The build succeeds and the Driver Station lists `MyTeleop` and `My Auto`.
Nothing moves, and nothing is supposed to. `setVoltage` exists but no button
calls it yet. Commands arrive in the next module.

Say out loud why `Arm` extends `Mechanism` and `MyTeleop` does not. A mechanism
is a piece of hardware that commands take turns using. An OpMode is a set of
controls. They are different jobs and the class each one extends says so.

## Watch out

In CodeRunner nothing on this branch can be observed running, because the code
has no simulation model and publishes no telemetry. The arm is real at the
bench and inert in the browser. Use this module to read and compile the code,
not to watch it work.
