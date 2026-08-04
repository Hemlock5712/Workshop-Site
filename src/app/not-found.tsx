import type { Metadata } from "next";
import WorkshopShell from "@/components/shell/WorkshopShell";
import NotFoundBody from "@/components/NotFoundBody";

/**
 * The 404, and it has to live here rather than under `(workshop)/`.
 *
 * A route group adds no path segment, so an unmatched top-level URL never
 * matches into the group — Next resolves it against the root `not-found.tsx`,
 * wrapped by `src/app/layout.tsx` only. A `not-found.tsx` inside
 * `(workshop)/` would only ever be reached by a `notFound()` call from a page
 * in that group, and nothing on the site calls one.
 *
 * That means the workshop chrome is not inherited and has to be mounted here
 * by hand. `WorkshopShell` brings its own `ShellProvider`, so the rail, the
 * breadcrumb bar, ⌘K and the scroll container all work. `AlphaBanner` and
 * `KeyboardNavigationProvider` are deliberately left out: one is a lesson-page
 * notice and the other binds prev/next keys for a lesson this page is not.
 */
export const metadata: Metadata = {
  title: "Page not found · Gray Matter Coding Workshop",
};

export default function NotFound() {
  return (
    <WorkshopShell>
      <NotFoundBody />
    </WorkshopShell>
  );
}
