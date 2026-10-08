# Brief: /dynamic-path-planning, "Pathfinding" (Workshop 6)

Branch **`swerve-pathfinding`** (page sets `branch`), one commit on `swerve-pathplanner`, off `1-Swerve`. **Not** on top of `6-ProfiledToPoint`: no vision, no `DriveToPoint` here. Diff: `Pathfinding.ensureInitialized()` first in the `DriveMechanism` constructor, a `pathfindTo(Pose2d)` method returning `AutoBuilder.pathfindToPose(...)` from `com.pathplanner.lib.command3`, one A binding, and `navgrid.json` (0.3 m nodes, 16.54 × 8.07 m field). 12 minutes. Vendordep `2027.0.0-alpha-7-commandsv3-1` (JosephTLockwood build), as CLAUDE.md now says.

## 1. Teaches (page order)

- **The navigation grid**: `deploy/pathplanner/navgrid.json`, 0.3 m squares, blocked or open. Open means "the _center_ of the robot can pass through without the bumpers touching anything", so the default grid blocks a wide band around the hub. "The margin is the bumper." Leave it as shipped until a run shows contact.
- **Find a route and drive it**: AD* runs on its own thread; start it before `AutoBuilder.configure`. `pathfindTo` uses the controller, config and flip `configure` already has; found routes get `PathConstraints(2.0, 2.0, 270°/s, 360°/s², 12 V)`.
- **What the command does**: plans from the pose at start; takes each refined route until within 2 m of the goal; finishes at the goal with zero speed; started within 0.5 m it sends zero and finishes without moving. The search start never moves, so a bumped robot is pulled back to the route.
- **Bind it**: `driver.a().whileTrue(drivetrain.pathfindTo(new Pose2d(7.5, 4.0, Rotation2d.ZERO)))`. "A canceled pathfind sends no zero." The joystick default is what stops it.
- **Good at crossing the field, poor at the last few centimeters**: get near, then Drive to Point.
- **Three failure shapes**: no route (keeps rolling, holds the drivetrain), grid too thin (clips the hub), bad pose (odd start).

## 2. Format: **hybrid**

Animated: the search and the follower on a top-down grid, which no screen recording shows (AdvantageScope only shows the result). Recorded: two short real-tool clips the page sends the student to, the PathPlanner app's **Navigation Grid** page and the AdvantageScope 2D field during the check.

**Shot list (recorded):**

1. PathPlanner app v2026.1.2, project open at `swerve-pathfinding`. Click **Navigation Grid** in the left nav. Zoom: the hub and its blocked band; hover one blocked square at the band's edge. Do not paint anything ("Leave it as shipped").
2. VS Code, `src/main/deploy/pathplanner/navgrid.json` collapsed, cursor on `"nodeSizeMeters":0.3`. Zoom to that key. Two seconds.
3. Sim running, Driver Station: auto picker on **Leave Start**, enable Autonomous; robot ends on the near side of the hub. Zoom: the auto drop-down.
4. Switch to **Teleop**, enable, hold A. AdvantageScope **2D Field** tab with `Drivetrain/Pose`. Zoom: the robot's trail curving beside the hub, then the stop near (7.5, 4.0) facing down-field. Hold A a few seconds after arrival: no drift.
5. Drive back with the sticks, hold A, release halfway. Zoom: the trail kinks and the robot answers the sticks immediately.

## 3. The concept that needs motion

**A route found, not drawn.** The grid lights cell by cell from the robot outward (search expanding), a rough route snaps in, then refines a few times while the robot is already driving, and the refinements stop at the 2 m ring around the goal. Prose can say "refines while driving"; only the animation shows the route redrawing under a moving robot. Second: **center point vs bumper**: a dot threading open cells while a translucent bumper square rides around it, never touching the hub because of the blocked margin; then a thin-margin grid where the dot is fine and the bumper clips. Third: **who stops it**: release, the pathfind lane is cut, the module bars stay lit on the last request for one frame until the joystick default lane takes over.

## 4. Student knows already / sets up

- **Knows:** `AutoBuilder.configure`, the Auto OpMode, `Selectable` auto chooser, drawn paths and that a path follower pulls a robot back to its path (/pathplanner); latched requests (/running-program#latched); scheduler lanes and the joystick default (/command-framework, /opmodes); Drive to Point and Profiled Drive to Point as the precise last stretch (/drive-to-point, /advanced-drive-to-point); a pose you trust (/swerve-calibration, /vision-implementation).
- **Sets up:** /drive-to-tag-inline (another way to get the last meter, from the camera).

## 5. Code on screen

`swerve-pathfinding`, `src/main/java/frc/robot/subsystems/DriveMechanism.java`:

```java
  public DriveMechanism() {
    // Load deploy/pathplanner/navgrid.json and start the route search on its own thread, now,
    // so the first request does not pay for it.
    Pathfinding.ensureInitialized();
    // ...
    AutoBuilder.configure(/* ... */);
  }

  public Command pathfindTo(Pose2d goal) {
    return AutoBuilder.pathfindToPose(
        goal, new PathConstraints(2.0, 2.0, Math.toRadians(270), Math.toRadians(360), 12.0));
  }
```

Imports to show if any: `com.pathplanner.lib.command3.AutoBuilder`, `com.pathplanner.lib.pathfinding.Pathfinding`, `org.wpilib.command3.Command`. Never `com.pathplanner.lib.auto.AutoBuilder`.

`src/main/java/frc/robot/opmodes/TeleopOpMode.java`:

```java
    driver.a().whileTrue(drivetrain.pathfindTo(new Pose2d(7.5, 4.0, Rotation2d.ZERO)));
```

Verified in the `commandsv3-1` sources jar: `command3/PathfindingCommand.run` is a coroutine `while (!pathfinder.isFinished()) { coroutine.yield(); pathfinder.update(); }`; `onCancel()` → `stop(true)`; `PathfindingFollower.stop` sends zero only when `!interrupted && goalEndState.velocityMPS() < 0.1`; `< 0.5` m at start sends zero and finishes; refinement cut-off `< 2.0` m. Worth one beat: the library's command is the same `while` + `yield` shape the student wrote in /coroutines.

## 6. Misconceptions / failure modes

- "A canceled pathfind sends no zero." Quiz 2: it is the joystick default, not the scheduler or the command. "Bind this anywhere without a drive default and the robot keeps its last request." (Link only; latched is owned by /running-program.)
- **No route**: "The command sends nothing and holds the drivetrain, so the last request stays on. Let go of A." A goal on a blocked square is _not_ this case: it moves to the nearest open square.
- **Clips the hub**: robot wider than the grid's margin; paint more squares blocked.
- **Odd start**: "The search trusts `getPose()`, so fix odometry or vision before the grid."
- Bumped mid-route: AD* does not restart from the new pose; the follower pulls it back (quiz 3).
- Precision: "Pathfind to a pose near the target, then finish with Drive to Point" (quiz 4).

## 7. Interactive moment idea

**"Move the hub's margin."** The viewer drags a slider for the blocked band's width; the route reflows, the bumper square either clears the hub or scrapes it (contact flash). Second option: **"Wall it off"**: paint cells to close the goal's area; the command shows no route, the robot sits on its last request with bars lit, and only releasing A (or the default lane) ends it.

## 8. Visual pieces needed beyond the field kit (see drive-to-point brief)

- **Nav grid overlay**: 0.3 m cells, blocked = hatched, open = clear; hub drawn as a solid obstacle with its blocked margin visibly wider than it.
- **Search expansion** effect (cells tinting outward), **route polyline** that redraws on refine, a **2 m ring** around the goal where redraws stop, and a **0.5 m ring** ("already there").
- **Center dot + bumper square** decoupled on the robot.
- **Push gesture** (a hand/arrow shoving the robot) for the bumped-off-route beat.
- **Scheduler lanes**: Drivetrain lane with `Pathfind` block and the joystick default resuming on release.
- Recorded-footage frames for PathPlanner Navigation Grid and AdvantageScope 2D Field.

## 9. Draft beat outline

1. **Name it.** "A drawn path starts where you drew it. Pathfinding starts wherever the robot is."
2. **Connect.** /pathplanner's drawn path; now the start is wherever the last play left you.
3. **The grid.** (recorded) Navigation Grid page; 0.3 m squares.
4. **The margin is the bumper.** Center dot threads open cells; bumper rides around it.
5. **Search, then refine.** Route appears, redraws while driving, stops redrawing at 2 m.
6. **Two lines of code.** `ensureInitialized` first; `pathfindTo` hands `AutoBuilder` a goal and limits.
7. **Hold A.** (recorded) AdvantageScope trail around the hub to (7.5, 4.0).
8. **Let go.** No zero from the pathfind; the default lane takes the drivetrain back. Without a default, it keeps rolling.
9. **Your turn.** Margin slider / wall it off.
10. **Three failure shapes.** Keeps rolling, clips the hub, odd start.
11. **Takeaway.** "Pathfinding crosses the field. The last few centimeters belong to a command built for them."

## 10. Site/branch mismatches

- None between page and branch; code blocks match `swerve-pathfinding` line for line.
- The `CLAUDE.md` loaded into agent context was an **older copy** that said no lesson uses `AutoBuilder`/`PathfindingCommand`; the on-disk `CLAUDE.md` (after #120) says the opposite and matches the branch. Make sure any downstream script writer reads the on-disk file.
- /advanced-drive-to-point claims this lesson "uses this one as the final approach"; it doesn't (see that brief).
- Branch chain jump: this lesson's branch has no vision and no `DriveToPoint`, while the lessons on both sides of it are on `5`/`6`/`7`. A student following branches in order switches chains here; the video should not imply continuity of the same project file.
