# Site overhaul to-do

What is left from the October 2026 review. The first pass merged to `master` as #119
(4508e70): code and tooling, the Tuner-then-code links, control
requests, the coroutine Core 5 and house rules, the Workshop 3 to 6 rewrites,
LimelightLib 2, PathPlanner 2027, and the Project
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
- [ ] **Re-record the Tuner X videos** on the real bench (the owner is
      recording them; simulation cannot show kG or the hand tests):
      `pid-control` `Pt7SBFfl3oM` (plus a flywheel one), `motion-magic`
      `7I7r9p1RBZI`, `mechanism-setup` `cDWF3bj1Juk` and `mjGn3y19eUc`,
      `hardware` `aktcCtcrEyY` and `TkScJADvD-Y`. The circled 2026.4
      screenshots landed in #128.
- [ ] **Control-system plate** for the bench mechanism (mentor request):
      needs Onshape CAD.
- [ ] **Analytics.** Vercel Analytics plus Speed Insights and PostHog all
      run. Pick one product-analytics tool or keep both.
- [ ] **MDX for lesson prose.** Optional; pilot on one page if wanted.
- [ ] **Pagefind for search.** Indexes the rendered HTML at build time with a
      small runtime stub, in place of the lazy MiniSearch. Sequence it with
      the MDX decision.
- [x] **Replace PathPlanner with BLine.** November 2026, owner's call:
      PathPlanner's 2027 editor has stalled upstream and the team does not
      want to maintain its Commands v3 fork. `swerve-bline` (off
      `swerve-autonomous`) is tested end to end in the editor and in
      simulation, and `/bline` replaces `/pathplanner`, which 308s to it.
- [ ] **BLine, what is left.** Run `swerve-bline` on the real robot (gains,
      traction, the stop on disable). Re-cut the four PathPlanner video beats
      for BLine. Untested so far: the editor's folder-picker export and the
      Windows desktop app.

## Still to do

- [ ] Run `pnpm spell` on Node 22.18 or later (cspell refuses 22.15).
- [ ] Wire `scripts/audit-ui.mjs` into CI against `next start`.
- [ ] Unverified on hardware: the VS Code and GitHub button labels on
      `/git-workflow`.
- [ ] Pages over the 12 minute target (all under the 15 cap, October 2026):
      `/pathplanner` 14.9, `/drive-to-point` 14.6, `/mechanisms` 14.0,
      `/coroutines` 13.9, `/pid-control` 13.9, `/swerve-drive-project` 13.8,
      `/git-workflow` 13.3, `/ai-coding-assistant` 13.1,
      `/finish-conditions` 12.6,
      `/logging-implementation` 12.2.
- [ ] Inline `style={{}}` props (about 400) to utility classes; split the
      large explainer components alongside the new unit tests.
