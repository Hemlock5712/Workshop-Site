# Brief: /pathplanner, "PathPlanner Paths" (Workshop 5, last lesson)

Branch `swerve-pathplanner` (parent `swerve-autonomous`). Page `time="30 minutes"`. PathPlannerLib is the team's Commands v3 build `2027.0.0-alpha-7-commandsv3-1`, package `com.pathplanner.lib.command3`. Desktop app v2026.1.2 (writes path version `2025.0`).

## 1. Teaches (page order)

- **Path vs auto**: a path is one drive start pose → end pose; waypoints shape the curve, rotation is set apart so swerve can travel one way while facing another. An auto is a list (path, action, path); the robot builds each auto into one command at boot.
- **Install and configure**: app, Open Robot Project, vendordep from URL, build; then **Settings → Robot Config** filled from real measurements, because the robot reads them back to decide how hard each wheel can push.
- **Draw a path and auto**: `Leave Start` path from the same tape mark, ideal starting rotation = bumper heading, goal 45°, velocity 0, global constraints 2 m/s and 2 m/s². Wrap it in a `Leave Start` auto with Reset Odometry on. Two shipped autos: Shoot and Leave, Neutral Zone Run (with an Intake zone).
- **Teach AutoBuilder the robot**: `AutoBuilder.configure(...)` once in the `DriveMechanism` constructor; import from `command3`.
- **One Auto OpMode**: delete `LeaveStartAuto.java`; register named commands first, `buildAutoChooser("Leave Start")`, `Tunables.publish("Auto", ...)`, `getSelected()` in `start()`. A canceled path sends no zero.
- **Three failure shapes** and the sim + floor check.

## 2. Format

**Hybrid: screen recording for the app, animated for path following.** Drawing a path, filling Robot Config and building an auto are procedures in a real tool, so record them. What the robot does with the file (a sampled trajectory, a controller pulling the robot back onto it, events firing in a zone) is a concept and gets animated on the shared field drawable.

**Shot list (PathPlanner app v2026.1.2, robot project from `swerve-pathplanner` checked out minus its `deploy/pathplanner` folder, or a fresh path alongside):**

1. App launch → **Open Robot Project** → pick folder containing `build.gradle`. Zoom: the folder picker's selected path.
2. **Settings** (gear) → **Robot Config** tab. Pan down the fields in table order: Robot Mass, Robot MOI, Bumper Width/Length, Wheel Radius, Drive Gearing, True Max Drive Speed, Drive Motor (Kraken X60), Current Limit, Wheel COF 1.2, Module Offsets. Zoom: each field as it's typed. Use the branch's shipped placeholder values (68 kg, MOI 8.0, 0.84 m, radius 0.055, gearing 7.364, 4.54 m/s, 120 A, ±0.254); these are generator defaults, not tuned gains.
3. Paths section **+** → name `Leave Start`. Zoom: name field.
4. Drag first waypoint onto a tape-mark location. Open **Ideal Starting State**, rotation 0. Zoom: the waypoint and the rotation field.
5. Drag last waypoint ~2 m out. **Goal End State**: rotation 45, velocity 0. Zoom: the robot outline rotating at the end.
6. **Global Constraints**: 2.0 / 2.0. Zoom: fields.
7. Scrub the **preview**; zoom wide enough to see the bumper outline sweep, not just the line.
8. Autos section **+** → `Leave Start` → drag the path into the command list → confirm **Reset Odometry** on. Zoom: the list and the toggle.
9. Open **Neutral Zone Run** and select `Start to Neutral Zone` to show the **Intake** event-marker zone highlighted on the path. Zoom: the zone.
10. VS Code: command palette → **WPILib: Manage Vendor Libraries** → **Install new libraries (online)** → paste the URL → Enter, then build. Zoom: the URL input. Keep it short.
11. Optional: sim GUI → NetworkTables → `Tunables/Auto/options` expanded showing the three autos and `None`.

## 3. The concept that needs motion

**The robot drives the plan, and corrects toward it.** On the top-down field a ghost setpoint robot slides along the drawn curve (position _and_ heading turning toward 45°), and the real robot follows slightly behind. Nudge the real robot sideways and a short correction arrow (the `PPHolonomicDriveController`) pulls it back. Contrast with Leave Start: the timer stopped "about 1.5 m, less the ramp"; the path stops on the waypoint.

Second: **an event zone.** As the robot enters the shaded Intake zone, an `Intake` chip appears in the scheduler timeline as a child of the path command; leaving the zone cancels it. Prose can say "starts when the robot enters, cancels when it leaves"; motion makes the zone and the timeline line up.

Third (one beat): **the bumper sweep.** The centre line clears the hub; the bumper corner clips it.

## 4. Student knows already / sets up

- **Knows:** Leave Start and its three numbers (/autonomous); wheel radius, top speed, slip current (/swerve-drive-tuning); blue-corner origin (/swerve-prerequisites); `Selectable`/`Tunables` not yet seen; named commands as stand-ins rely on `Command.noRequirements(coroutine -> ...)` and `coroutine.park()` from /coroutines; latched request (callback only).
- **Sets up:** Workshop 6. /vision-implementation makes `Drivetrain/Pose` trustworthy over a match; `swerve-pathfinding` (/dynamic-path-planning) reuses `AutoBuilder` via `pathfindToPose`.

## 5. Code on screen

Vendordep URL (page block): `https://raw.githubusercontent.com/JosephTLockwood/pathplanner/vendordep/PathplannerLib.json`

`swerve-pathplanner`, `src/main/java/frc/robot/subsystems/DriveMechanism.java` (constructor, matches page):

```java
AutoBuilder.configure(
    () -> getPose(),
    pose -> resetPose(pose),
    () -> getRobotVelocity(),
    speeds -> drivetrain.setControl(pathRequest.withVelocity(speeds)),
    new PPHolonomicDriveController(
        new PIDConstants(5.0, 0.0, 0.0), new PIDConstants(5.0, 0.0, 0.0)),
    loadPathConfig(),
    () -> MatchState.getAlliance().orElse(Alliance.BLUE) == Alliance.RED,
    this);
```

The `5.0` gains are branch placeholders marked TODO, not tuned; fine on screen, but label them "starting values".

`src/main/java/frc/robot/opmodes/AutoOpMode.java` (matches page):

```java
NamedCommands.registerCommand(
    "Shoot",
    Command.noRequirements(coroutine -> coroutine.wait(Seconds.of(1.0))).named("Shoot"));
NamedCommands.registerCommand(
    "Intake", Command.noRequirements(coroutine -> coroutine.park()).named("Intake"));

autoChooser = AutoBuilder.buildAutoChooser("Leave Start");
Tunables.publish("Auto", autoChooser);
...
public void start() {
  routine = autoChooser.getSelected();
  Scheduler.getDefault().schedule(routine);
}
```

Shipped autos (verified in `.auto` files): Shoot and Leave = `Start to Shoot` → `Shoot` → `Shoot to Neutral Zone`; Neutral Zone Run = `Start to Neutral Zone` (Intake marker, waypoint-relative 1.2 to 2.0) → `Neutral Zone to Shoot` → `Shoot`.

## 6. Misconceptions / failure modes

- Robot faces along the curve (quiz 1): rotation is "set apart from" the waypoints.
- Robot Config only affects the preview (quiz 2): "A guessed number shapes every path the robot drives."
- A clear line means a clear robot (quiz 3): "The line is the path of one point, the center of the robot."
- Registration order doesn't matter (quiz 4): `buildAutoChooser` loads every auto, which looks up named commands then. Verified: a missing name logs a DS warning and becomes a no-op command.
- Wrong `AutoBuilder` import: "The one in `com.pathplanner.lib.auto` makes commands for the other framework, and they will not compile." Video: say "import from command3", don't name the other framework.
- Reading the chooser in the constructor: "someone can still change the drop-down after picking the mode."
- **A canceled path sends no zero** (verified: `FollowPathCommand.onCancel` → `follower.stop(true)`, zero only when not interrupted and goal velocity < 0.1). "In auto, disabling cuts the output." Callback to latched video, one line.
- Failure shapes: does nothing (name mismatch letter for letter), wrong place (start rotation vs tape), lags/overshoots ("Fix the config before the gains").

## 7. Interactive moment idea

**"Push it off the path."** The robot follows `Leave Start` on the field drawable; the viewer drags (or presses arrow keys to shove) the robot sideways mid-path. The correction arrow grows with the error and the robot rejoins the ghost and still finishes at the end waypoint, turned to 45°. Optional second toggle: "Disable mid-path" leaves the swerve card on its last non-zero request, with a caption that in auto, disable cuts output.

## 8. Visual pieces needed beyond the kit

- **Field + robot drawable** (see autonomous.md), plus: a **drawn Bézier path** with waypoints and control handles; **ghost setpoint robot** riding the trajectory with heading; **correction arrow** from robot to ghost; a shaded **event zone** along a path segment; a **hub/obstacle** block for the bumper-sweep beat with bumper corners highlighted.
- **Auto list card** mirroring the app's command list: path / named / path boxes, each lighting as it runs.
- **Scheduler timeline** with a path command and a child `Intake` bar starting and ending at the zone edges.
- **Dashboard drop-down** `Tunables/Auto` with Leave Start (default), None, Shoot and Leave, Neutral Zone Run.

## 9. Draft beat outline

1. **Callback.** Leave Start's three end-pose dots and the 1.5 s wait. "A wait doesn't know where it ends. A path does."
2. **Path vs auto.** One curve vs a list of boxes.
3. **Robot Config** (recorded). "These numbers decide how hard each wheel can push."
4. **Draw it** (recorded). Same tape mark, end 2 m out, turned 45°, preview with the bumper outline.
5. **Wrap it in an auto** (recorded). Reset Odometry on.
6. **Teach AutoBuilder.** Code panel: where it is, how to reset it, how fast it's moving, how to drive it.
7. **One Auto OpMode.** Register names, build the drop-down, read it at `start()`.
8. **Following** (animated). Ghost leads, robot follows, heading turns as it goes.
9. **Your turn.** Shove it off the path.
10. **Events.** Neutral Zone Run; Intake lights in the zone, cancels on leaving; Shoot takes a second at the end.
11. **Failure shapes.** Name mismatch, start rotation wrong, config guessed. Bumper clip on the hub.
12. **Check.** Three floor runs cluster tighter than Leave Start's three.

## 10. Site/branch mismatches

- Page, branch and CLAUDE.md agree on the shape: `command3` imports, register-then-build order, `buildAutoChooser("Leave Start")`, `Tunables.publish("Auto", ...)`, `getSelected()` in `start()`, cancel in `end()`, `Tunables.remove("Auto")` in `close()`, `ApplyRobotVelocity` request, `RobotConfig.fromGUISettings()`. Vendordep JSON on the branch pins the same version and URL.
- **The system-prompt copy of CLAUDE.md that subagents receive is stale**: it still describes alpha-4, non-command classes only, `Selectable<PathPlannerPath> autoPath` in `Robot`, a Follow Path OpMode, and an alpha-4 crash WatchOut. The on-disk CLAUDE.md (commit 63b1522) is current and matches the page. If any other agent was briefed from the injected copy, its output on PathPlanner is wrong.
- Robot Config table: page says MOI for "0.84 m square comes to about 8.0" (68 × 1.4112 / 12 = 8.0, checks). Wheel radius 2.167 in × 0.0254 = 0.055, gearing 7.364, top speed 4.54, slip 120 A, offsets 0.254 all match `settings.json` and `TunerConstants`.
- "Does nothing" card says the driver station "reports a missing file, or the auto skips an action." Verified for named commands (DS warning + no-op). Not verified what a missing `.path` does at boot in this build.
- Page `time="30 minutes"` is over the 15-minute cap; same note as /autonomous.
- Vendordep install is described two ways across the course: here via the command palette ("WPILib: Manage Vendor Libraries → Install new libraries (online)"), on /vision-implementation via the **WPILib Vendor Dependencies** activity-bar view → **INSTALL FROM URL**, with a screenshot. Pick one, so the two recordings show the same flow.
