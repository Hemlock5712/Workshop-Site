import WorkshopShell from "@/components/shell/WorkshopShell";
import AutoFocusMain from "@/components/AutoFocusMain";
import KeyboardNavigationProvider from "@/components/KeyboardNavigationProvider";
import KeyboardShortcutsHelp from "@/components/KeyboardShortcutsHelp";
import AnalyticsBanner from "@/components/AnalyticsBanner";
import AlphaBanner from "@/components/AlphaBanner";

/**
 * Every workshop route renders inside the shell: rail on the left, sticky
 * breadcrumb bar on top, one scrolling column.
 *
 * There is no site footer here. On a lesson page the last thing on screen
 * should be the link to the next lesson, not a copyright line — the footer
 * lives on the home page, which is where someone looking for it goes.
 */
export default function WorkshopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkshopShell>
      <KeyboardNavigationProvider />
      <AutoFocusMain />
      <AlphaBanner />
      {children}
      <KeyboardShortcutsHelp />
      <AnalyticsBanner />
    </WorkshopShell>
  );
}
