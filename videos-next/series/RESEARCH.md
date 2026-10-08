# Researching a lesson for the video series

You're writing a **brief** for one lesson page, so the parent can write the narration. Workshops 2 to 4 are done:
`series/series.json` has their approved scripts, and `series/briefs/*.md` has their briefs. Read two of each
(`running-program` is the reference video, "The Latched Request"; `motion-magic-code` is another) to see the shape and the voice.

## Sources, in order of trust

1. The lesson page: `src/app/(workshop)/<slug>/page.tsx`. Prose, code blocks, quizzes, WatchOuts, "You should see" steps.
2. Teaching code: `reference/Workshop-Code/<branch>/` (local worktrees; `git -C reference/.git-store/Workshop-Code.git diff A B` shows what a lesson adds). The swerve chain is `1-Swerve`, `2-Logging`, `3-Limelight`, `4-DynamicFlywheel`, `5-DriveToPoint`, `6-ProfiledToPoint`, `7-InlineCommands`, and `swerve-autonomous` → `swerve-pathplanner` → `swerve-pathfinding`. It still uses `frc.robot.subsystems` / `frc.robot.opmodes`; show it as it is.
3. `CLAUDE.md` at the repo root, section "Workshop Content Stack": PathPlanner (the team's Commands v3 PathPlannerLib build, `com.pathplanner.lib.command3`), LimelightLib 2 (vendordep URL pinned to the alpha; the class is `Vision`, not `Limelight`), swerve stop rules (`SwerveRequest.Idle` is not a stop), and the rest. **Don't trust** other markdown (README, context/*.md, MODERNIZATION_STATUS.md); it's stale.
4. Installed WPILib / vendor sources under `C:\Users\Public\wpilib\2027_alpha7\maven\` if you need to confirm an API exists.

Never invent an API. Never mention Commands v2 or "the old way". Lambdas `() -> foo()`. No enums. No AdvantageKit.

## The brief, one file per lesson: `series/briefs/<slug>.md`, under ~900 words

1. **Teaches**: the core ideas in page order (3–6 bullets, the page's own terms).
2. **Format**: one of **animated** (a concept a moving picture explains), **screen recording** (a procedure in a real tool: Tuner X, PathPlanner app, Phoenix swerve generator, Limelight web UI, VS Code, AdvantageScope), or **hybrid** (a short animated concept plus recorded footage). Say why. For recordings, list the **shot list**: each screen and action in order, what should be visible, and what the zoom should focus on. A capture pipeline that auto-zooms to clicks will be built from this.
3. **The concept that needs motion** (animated / hybrid only), and why prose can't carry it.
4. **Student knows already** (cite lessons) / **Sets up** (what the next lesson needs). Continuity matters: each video opens from something the student already did.
5. **Code or settings on screen**: exact snippets (branch + path, or "page code block"), trimmed. For tools, the exact setting names and values the page uses. No tuned gains as copyable numbers.
6. **Misconceptions / failure modes** the page warns about (quote briefly).
7. **Interactive moment idea**: what the student drives while the narration waits (animated / hybrid only).
8. **Visual pieces needed** beyond the existing kit (controller, arm, flywheel, motor card, code panel, scheduler timeline). Swerve will need a top-down robot / field drawable; say what it must show.
9. **Draft beat outline**: 6–12 beats, one line each.
10. **Site/branch mismatches** you found (page vs branch vs CLAUDE.md), so they can be fixed.

Write the files, then return a 3-line summary per lesson: the format, the concept, and anything surprising.
