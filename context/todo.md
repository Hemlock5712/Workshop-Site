# Site overhaul to-do

What is left from the October 2026 review. The first pass merged to `master` as #119
(4508e70): code and tooling, the Tuner-then-code links, control
requests, the coroutine Core 5 and house rules, the Workshop 3 to 6 rewrites,
LimelightLib 2 on `/drive-to-tag-inline`, PathPlanner 2027, and the Project
Structure, Git and Pull Requests, Testing and Swerve Drive Tuning lessons.
Check items off as they land and delete this file when the list is empty.

## Needs the owner

- [x] **PathPlannerLib crash.** Fixed by giving each `RobotConfig` alert its
      own ID; the team's `2027.0.0-alpha-7-commandsv3-1` build carries it, and
      the WatchOut is gone from `/pathplanner`.
- [ ] **A Commands v3 layer for PathPlannerLib, upstream.** Built as
      `com.pathplanner.lib.command3` on JosephTLockwood/pathplanner
      `new-path-2027-commands-v3`, and `/pathplanner` installs it from that
      fork's `vendordep` branch. Propose it upstream, and point the lesson
      back at the official vendordep once a release ships it.
- [ ] **Re-record the Tuner X videos** (2026 moved configs to a nested menu):
      `pid-control` `Pt7SBFfl3oM`, `motion-magic` `7I7r9p1RBZI`,
      `mechanism-setup` `cDWF3bj1Juk` and `mjGn3y19eUc`; lower priority
      `hardware` `aktcCtcrEyY` and `TkScJADvD-Y`.
- [ ] **Control-system plate** for the bench mechanism (mentor request):
      needs Onshape CAD.
- [ ] **Analytics.** Vercel Analytics plus Speed Insights and PostHog all
      run. Pick one product-analytics tool or keep both.
- [ ] **MDX for lesson prose.** Optional; pilot on one page if wanted.
- [ ] **Pagefind for search.** Indexes the rendered HTML at build time with a
      small runtime stub, in place of the lazy MiniSearch. Sequence it with
      the MDX decision.
- [ ] **PathPlanner 2027.1 editor.** The fork's `path2-2027-1` loads the new
      graph files and converts their center origin to WPILib's blue-wall
      frame. Follow-up PR after #121: rebuild `swerve-pathplanner` and
      `swerve-pathfinding`, rewrite `/pathplanner`, `/dynamic-path-planning`
      and `/autonomous`, and record the four PathPlanner video beats.
- [ ] **Report the 2027 app's Navigation Grid upstream.** It draws the
      unchanged `navgrid.json` from the opposite corner, so a grid edited in
      the 2027 app loads rotated half a turn. Lessons say to leave the grid
      as shipped until it is fixed.

## Still to do

- [ ] Rebuild `7-InlineCommands` on LimelightLib 2 so `/drive-to-tag-inline`
      can set its `branch` prop again (the page is ahead of the branch, like
      `/vision-implementation` and `3-Limelight`).
- [ ] Run `pnpm spell` on Node 22.18 or later (cspell refuses 22.15).
- [ ] Wire `scripts/audit-ui.mjs` into CI against `next start`.
- [ ] Unverified on hardware: the `/drive-to-tag-inline` axis signs (from
      the LimelightLib 2 javadoc), the VS Code and GitHub button labels on
      `/git-workflow`, and the 12.5 V threshold in `/testing`'s checklist.
- [ ] Pages over the 12 minute target (all under the 15 cap, October 2026):
      `/pathplanner` 14.9, `/drive-to-point` 14.6, `/mechanisms` 14.0,
      `/coroutines` 13.9, `/pid-control` 13.9, `/swerve-drive-project` 13.8,
      `/git-workflow` 13.3, `/ai-coding-assistant` 13.1,
      `/drive-to-tag-inline` 12.7, `/finish-conditions` 12.6,
      `/logging-implementation` 12.2.
- [ ] Inline `style={{}}` props (about 400) to utility classes; split the
      large explainer components alongside the new unit tests.
