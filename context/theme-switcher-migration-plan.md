# Theme Switcher Migration Plan

This plan outlines the work required to replace the current custom theme switcher with the Magic UI Animated Theme Toggler that is installed through `pnpm dlx shadcn@latest add @magicui/animated-theme-toggler`.

## 1. Preparation (Day 0)
- **Audit current switcher**
  - Trace the existing theme state management (Zustand store, context providers, layout usage).
  - Document persistence behavior (localStorage keys, default theme selection logic, SSR hydration safeguards).
  - Capture all components that consume the theme state or toggle handler.
- **Inventory dependent assets**
  - List custom icons, animations, analytics hooks, or CSS variables tied to the switcher.
  - Flag any Storybook stories or unit tests referencing the current component.
- **Environment readiness**
  - Confirm pnpm version ≥ 9 and that the `shadcn/ui` CLI is already initialized (presence of `components.json` or equivalent config).
  - Identify required developer permissions to install new generators or dependencies.

## 2. Installation & Scaffolding (Day 1)
- **Generate component**
  - Run `pnpm dlx shadcn@latest add @magicui/animated-theme-toggler` on a feature branch.
  - Stage and review generated files under `src/components/ui/animated-theme-toggler`.
- **Align module resolution**
  - Ensure imports use existing aliases (e.g., `@/components`). Adjust generated files or update `tsconfig.json` path aliases if necessary.
- **Dependencies & styles**
  - Verify peer dependencies (Framer Motion, Radix primitives, Tailwind plugins) and add to `package.json` if missing.
  - Update `tailwind.config.ts` or global styles to include any required keyframes, CSS variables, or plugin registrations.

## 3. Integration (Day 2)
- **Component replacement**
  - Swap the current toggle with `<AnimatedThemeToggler />` in shared navigation/layout components.
  - Update props or wrappers so the new component receives required theme context.
- **Clean up legacy code**
  - Remove obsolete state slices, hooks, or utilities tied to the old implementation after confirming no remaining references.
  - Delete unused assets (icons, styles) and update documentation snippets.
- **Theme persistence alignment**
  - Ensure the new toggler respects stored preferences (localStorage, cookies) and works with SSR/Next.js App Router expectations (`data-theme` or `class` strategy).
  - Adjust Tailwind dark mode strategy if the component requires `class` vs. `data-theme` toggling.

## 4. Testing & Validation (Day 3)
- **Manual verification**
  - Run the app locally and confirm animation, accessibility (keyboard focus, aria labels), and persistence across reloads.
  - Test responsive breakpoints (mobile nav drawer vs. desktop header) to ensure layout stability.
- **Automated checks**
  - Execute `pnpm lint`, `pnpm type-check`, and any relevant unit/component tests touching theme logic.
  - Add or update tests to cover new behavior if gaps are discovered.
- **Documentation updates**
  - Update README or developer docs with installation notes, migration gotchas, and any new commands.

## 5. Deployment & Follow-up (Day 4)
- **Change management**
  - Communicate the migration timeline to teammates; ensure no open PRs depend on the old switcher.
  - Merge feature branch after approvals and CI success.
- **Post-deploy verification**
  - Monitor production deployment for regression reports or telemetry anomalies related to theme switching.
  - Schedule a retrospective to capture lessons learned and potential UI polish tasks.

## Deliverables
- Updated UI component files and dependency configuration.
- Documentation outlining new theme toggler usage and persistence behavior.
- Test evidence (manual + automated) demonstrating regression-free migration.
