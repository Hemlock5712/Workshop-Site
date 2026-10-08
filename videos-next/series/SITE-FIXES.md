# Site and branch fixes found while researching the videos

October 2026. Each item was checked against the branch before it was touched.

## Applied to the site (uncommitted)

| Page                     | Was                                                               | Now                                                                                         |
| ------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| /java-basics             | lambda table and quiz 2 used `() -> motor.stopMotor()`            | `() -> stopMotor()`, as on mech-2                                                           |
| /command-framework       | "Priorities are new in Commands v3"                               | "Every command has a priority"                                                              |
| /logging-implementation  | needs "the project from Hardware Simulation"                      | "the project from Coroutines" (the lesson's actual predecessor)                             |
| /drive-to-point          | "the branch's copy still sends" Idle                              | removed; 5-DriveToPoint's `end()` already sends zero `ChassisVelocities`                    |
| /advanced-drive-to-point | "87 lines to 120"; "as the final approach after dynamic planning" | 88 → 121; the final-approach claim removed (no branch does that)                            |
| /drive-to-tag-inline     | code comment said 7-InlineCommands has "the Idle stop"            | says what is really stale there: copied LimelightHelpers, old target-space axes             |
| /swerve-drive-project    | wheel radius is "half the tread width"                            | "half the wheel's diameter"                                                                 |
| /swerve-calibration      | offsets "came off somebody else's robot"                          | came from wheels held straight by eye in the generator (that page writes the student's own) |

## Needs a decision

1. **DONE: Workshop-Code comment fixes.** Pushed October 2026: comments only, one commit per lesson kept, every branch builds and is formatter-clean (Robot.java javadoc was off-format on every branch before). Originally: (ready: `reference/work/fix-chain-comments.sh`). On mech-1, the Arm/Flywheel javadoc says "extend Mechanism". On mech-3 through mech-6, the MyTeleop comment says a released arm "holds where it is", but it finishes the move first. The script changes comments only, rewrites the chain locally, and does not push.
2. **Flywheel Motion Magic numbers.** The page's paste block shows cruise/accel `0.0`; mech-3+ Flywheel ships `100.0` / `1000.0`. Either the page shows the real values, or the branch ships zeros like the arm, so a fresh clone holds still.
3. **DONE: swerve download tag.** Released `v3.1-swerve` at 1-Swerve cdee4c0, and the page link and CLAUDE.md now point to it. Was: `/swerve-drive-project`'s button pulls release `v3.0-swerve` (commit 06d3460): alpha-6, `extends Mechanism`, Phoenix 26.50. That's one commit behind `1-Swerve` (cdee4c0, alpha-7). It needs a new tag or release before the page is right.
4. **RESOLVED: vision timestamps.** No conversion needed: WPILib, Phoenix and Limelight are unifying on one timebase (owner's call, October 2026), and Phoenix 26.70 already dropped `Utils.fpgaToCurrentTime`. Original note: `addVisionMeasurement` wants Phoenix's `Utils.getCurrentTimeSeconds()` timebase, and the branch's own javadoc says so. `estimate.timestampSeconds` is passed straight through with no `Utils.fpgaToCurrentTime`. Check on SystemCore before trusting it.
5. **/swerve-drive-tuning radius direction.** The prose primes "the effective wheel is squashed, so smaller", but the worked example and quiz 2 make the radius bigger. One of them has to change; it depends on which way the bench measurement actually went.
6. **Logging in swerve lessons.** /swerve-calibration and /swerve-drive-tuning ask for a `.wpilog`, but `1-Swerve` never calls `DataLogManager.start()` (`2-Logging` adds it). A live AdvantageScope plot works on 1-Swerve; the page could ask for that instead.
7. **/vision-hardware tag size.** The setup steps never set the tag size, yet the check section and quiz 4 diagnose a wrong one. Add the step, using the Limelight UI's real label (check it on the device).
8. **Lesson length.** /autonomous and /pathplanner are each ~30 min, twice the 15-minute cap. Split?
9. **Vendordep install** is taught two ways: the command palette on /pathplanner, and the Vendor Dependencies view on /vision-implementation. Pick one.
10. **Swerve branch `Robot.java`** puts the comment "Brake while disabled" on a `SwerveRequest.Idle` binding; Idle doesn't brake. Fix it when the swerve chain is rebuilt.
11. **/vision-implementation `needs`** asks for logging, which the lesson doesn't use.
