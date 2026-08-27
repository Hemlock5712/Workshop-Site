## Steps

1. Open `Arm.java` and find the config built in the constructor. It is one
   chained expression: `withMotorOutput`, `withSlot0`, `withMotionMagic`.
2. Read the four numbers inside it. `kG`, `kS`, `kP` and the two Motion Magic
   limits all ship at `0.0`.
3. Note the control request has changed. `VoltageOut` is gone and
   `MotionMagicVoltage` has taken its place, so `setPosition` asks for an angle
   instead of a push.
4. Open `TeleopOpMode.java` and see the buttons now call `vertical()` and
   `horizontal()` rather than `runFast()`.

## Check yourself

Every gain here is zero, so a fresh clone holds the arm still. That is
deliberate, not a bug. The numbers come from your own mechanism, measured in
Phoenix Tuner X in Workshop 1, and Tuner X writes this exact block for you
under the three-dot **Generate Code** action on the config panel. You paste it
over the one in the constructor. You do not type gains by hand.

You should be able to say why `kG` exists on the arm and not on the flywheel.
Gravity pulls on an arm at every angle and never on a wheel.

## Watch out

This module has no lesson page on the site yet, and it is the handoff the
course is missing: Workshop 1 measures the gains and nothing tells a student
where to put them. Read `/pid-control` and `/motion-magic` alongside it.

Nothing here can be checked in CodeRunner. Closed-loop position needs a real
encoder reading back, the code has no simulation model, and the browser has no
arm. This module is for reading the config, not for running it.
