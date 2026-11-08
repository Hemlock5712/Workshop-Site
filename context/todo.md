# Site overhaul to-do

What is left from the October 2026 review. Check items off as they land and
delete this file when the list is empty.

## Needs the owner

- [ ] **Re-record the Tuner X videos** on the real bench (the owner is
      recording them; simulation cannot show kG or the hand tests):
      `pid-control` `Pt7SBFfl3oM` (plus a flywheel one), `motion-magic`
      `7I7r9p1RBZI`, `mechanism-setup` `cDWF3bj1Juk` and `mjGn3y19eUc`,
      `hardware` `aktcCtcrEyY` and `TkScJADvD-Y`.
- [ ] **BLine on the real robot.** Run `swerve-bline` for gains, traction and
      the stop on disable. Untested so far: the editor's folder-picker export
      and the Windows desktop app.
- [ ] **Control-system plate** for the bench mechanism (mentor request):
      needs Onshape CAD.
- [ ] **Analytics.** Vercel Analytics plus Speed Insights and PostHog all
      run. Pick one product-analytics tool or keep both.
- [ ] **MDX for lesson prose.** Optional; pilot on one page if wanted.
- [ ] **Pagefind for search.** Indexes the rendered HTML at build time with a
      small runtime stub, in place of the lazy MiniSearch. Sequence it with
      the MDX decision.

## Still to do

- [ ] Wire `scripts/audit-ui.mjs` into CI against `next start`.
- [ ] Unverified on hardware: the VS Code and GitHub button labels on
      `/git-workflow`.
- [ ] Pages over the 12 minute target (all under the 15 cap, November 2026):
      `/drive-to-point` 14.7, `/mechanism-setup` 14.2, `/mechanisms` 14.0,
      `/coroutines` 13.5, `/swerve-drive-project` 13.2,
      `/ai-coding-assistant` 13.1, `/git-workflow` 13.0, `/bline` 12.7,
      `/pid-control` 12.7, `/finish-conditions` 12.1.
- [ ] Inline `style={{}}` props (about 400) to utility classes; split the
      large explainer components alongside the new unit tests.
