# Brief: /advanced-drive-to-point, "Profiled Drive to Point" (Workshop 6)

Branch **`6-ProfiledToPoint`** (page sets `branch`). One file changes from `5-DriveToPoint`: `commands/DriveToPoint.java`, 88 → 121 lines (page says "87 lines to 120"; off by one, harmless). Bindings unchanged. 12 minutes.

## 1. Teaches (page order)

- **The trip planner**: Phoenix 6's `LinearPath` takes two `TrapezoidProfile.Constraints` (drive 2.5 m/s, 3.0 m/s²; turn `Math.PI` rad/s, `2.0 * Math.PI` rad/s²). Each loop it answers: at _t_ seconds in, where should the robot be and how fast? → `LinearPath.State` with `pose` and `velocity`.
- **Same shape as Motion Magic**: speed up (≈0.83 s, ≈1.04 m), cruise, slow down. A trip under **2.1 m** never reaches cruise and comes out a triangle, "no special case to write."
- **Make the change**: `startState` snapshot from `getPose()` and `getFieldVelocity()` plus `startTime` in `initialize()`. A robot already rolling gets a plan from its real speed.
- **The new loop**: planned velocity is feedforward and goes out as is; each PID adds a correction toward `setpoint.pose`. "On a perfect floor every correction would be zero."
- **Finish line is the plan's clock**: `path.isFinished(t)`. "A clock, not a tape measure."
- **Lower the gains**: error is now plan-vs-measured, centimeters, so 10/10/7 → 3.0/3.0/4.0. Left at 10, "the robot hunts around the path."

## 2. Format: **animated**

The whole lesson is one picture: a ghost robot walking a planned trapezoid down a straight line, the real robot chasing it, and the PID arrow now pointing at the ghost instead of the goal. That moving-target idea is exactly what prose struggles with ("the error is the gap to the _plan_, not to the goal").

## 3. The concept that needs motion

**Feedforward drives, feedback trims.** Show the planned velocity arrow (big) and the correction arrow (small) stacked on the robot, with the correction pointing at the ghost setpoint. Then the gain comparison: at kP 10 the correction arrow overreacts and the robot weaves around the ghost (the /pid-control _Buzzes_ shape); at 3.0 it rides the ghost. Second: **trapezoid vs triangle**: drag the goal closer than 2.1 m and the velocity plot's flat top disappears live. Third: **the clock finish**: hold the robot back (friction slider) and the command ends on schedule anyway, short of the goal.

## 4. Student knows already / sets up

- **Knows:** Motion Magic's cruise velocity + acceleration and its trapezoid on one motor (/motion-magic, the ghost-arm trapezoid from the /motion-magic-code video: same plot, now in meters); _Buzzes_ / _Falls short_ (/pid-control); a finish condition asked every loop and "a timeout is not arrival" (/finish-conditions); steps vs holds and sequences (/chaining-commands); `DriveToPoint` with raw P (/drive-to-point).
- **Sets up:** a command that finishes is a step, so it can go in `Command.sequence(...)` and serve as a final approach after /dynamic-path-planning. Drive to Tag reuses the "profile plus correction" sum via `ProfiledPIDController`.

## 5. Code on screen

`6-ProfiledToPoint`, `commands/DriveToPoint.java`, trimmed:

```java
  private final LinearPath path =
      new LinearPath(
          new TrapezoidProfile.Constraints(2.5, 3.0),
          new TrapezoidProfile.Constraints(Math.PI, 2.0 * Math.PI));

  private final PIDController xController = new PIDController(3.0, 0.0, 0.0);
  private final PIDController yController = new PIDController(3.0, 0.0, 0.0);
  private final PIDController headingController = new PIDController(4.0, 0.0, 0.0);

  @Override
  protected void initialize() {
    startState = new LinearPath.State(drivetrain.getPose(), drivetrain.getFieldVelocity());
    startTime = Utils.getCurrentTimeSeconds();
    // ...reset the three controllers
  }

  @Override
  protected void execute() {
    double t = Utils.getCurrentTimeSeconds() - startTime;
    LinearPath.State setpoint = path.calculate(t, startState, goal);
    Pose2d measuredPose = drivetrain.getPose();

    ChassisVelocities feedforward = setpoint.velocity;
    double vx = feedforward.vx + xController.calculate(measuredPose.getX(), setpoint.pose.getX());
    double vy = feedforward.vy + yController.calculate(measuredPose.getY(), setpoint.pose.getY());
    // omega: same shape on heading
    drivetrain.setControl(driveRequest.withVelocity(new ChassisVelocities(vx, vy, omega)));
  }

  @Override
  protected boolean isFinished() {
    return path.isFinished(Utils.getCurrentTimeSeconds() - startTime);
  }
```

`end()` is unchanged: zero `ChassisVelocities` on `driveRequest`. Gains and limits are the branch's TODO starting points printed on the page. `LinearPath` verified in Phoenix 6 `wpiapi-java-26.70.0-alpha-2` sources (`com/ctre/phoenix6/swerve/utility/LinearPath.java`).

## 6. Misconceptions / failure modes

- **Lunges the wrong way**: the `startState` line is missing, so the plan is drawn from an empty `new LinearPath.State()` (the origin, at rest).
- **Weaves along the path**: gains still 10/10/7; "the correction piles onto a plan that was already asking for the right speed. Ten centimeters of drift buys another meter per second."
- **Stops short**: graph speed. Never reaches the flat top → limits past what the drivetrain can do; reaches it → gains too small.
- **The clock finish**: "Fall behind the plan and the command still ends on schedule, wherever the robot happens to be. That is the trade for a finish line that cannot hang." Same lesson as /finish-conditions' "a timeout is not arrival".
- 2.5 m/s is about half of 4.54 on purpose: "That headroom is where the correction goes."

## 7. Interactive moment idea

**"Push it off the plan."** While the robot rides the ghost, the viewer can shove it sideways (drag). The correction arrow grows toward the ghost and pulls it back. A gain switch (10 / 3) on screen: at 10 the shove ends in a weave; at 3 it settles. Then a "goal distance" handle: drag under 2.1 m and the trapezoid becomes a triangle in the plot.

## 8. Visual pieces needed beyond the field kit (see drive-to-point brief)

- **Ghost setpoint robot** that walks the straight line on the profile clock, plus a dashed straight-line path from start snapshot to goal.
- **Two stacked arrows** on the robot: feedforward (accent) and correction (thin, mono-labeled), summing into the sent velocity.
- **Velocity-vs-time plot** reused from the /motion-magic-code video, relabeled m/s; phases "speed up / cruise / slow down"; a playhead; a dashed "plan ends" line on the time axis for the clock finish.
- **Start snapshot marker**: a pinned "t = 0" pose + velocity chip at the start, and a broken variant at the origin for the missing-snapshot failure.
- **Scheduler lane** showing the command ending on its own while B is still held (drivetrain lane returns to the joystick default).

## 9. Draft beat outline

1. **Name it.** "Plan the whole trip before the robot moves, then follow the plan."
2. **Connect.** Last time: 30 m/s asked for three meters out, then a crawl. Replay the clipped arrow and creep in two seconds.
3. **You've seen this shape.** The Motion Magic trapezoid from the arm, re-axised in meters: 2.5 m/s cruise, 3.0 m/s² ramp.
4. **Triangle.** Under 2.1 m there's no middle; the flat top folds away.
5. **The snapshot.** Button down: pose and current velocity pinned; the plan starts there, rolling or not.
6. **Every loop.** Clock ticks, ghost moves, `path.calculate` returns pose + velocity.
7. **Feedforward drives, feedback trims.** Big arrow, small arrow, pointing at the ghost.
8. **Your turn.** Shove it; flip the gain between 10 and 3.
9. **Why 3.** At 10, centimeters of drift become meters per second: _Buzzes_ from /pid-control.
10. **A clock, not a tape measure.** Command ends when the plan does; hold B and it stays stopped. Drag it back and it ends short anyway.
11. **Takeaway.** "A command with an ending is a step. It can go in a sequence, and it can finish what a pathfinder starts."

## 10. Site/branch mismatches

- Line counts: page says 87 → 120, branch is 88 → 121.
- The closing paragraph says "**Dynamic Path Planning** uses this one as the final approach, after a planner handles the trip across open field." Not true on any branch: `swerve-pathfinding` is off `1-Swerve` and has no `DriveToPoint`, and its page only _recommends_ finishing with Drive to Point in prose. The lesson title is also "Pathfinding" now, not "Dynamic Path Planning". Reword to "Pathfinding recommends this as the last stretch" or similar, and don't show a pathfind-then-DriveToPoint sequence in the video as if it were branch code.
