import Box from "@/components/Box";

/**
 * Standard "this is alpha software" stamp for lesson pages whose code
 * targets the WPILib 2027 alpha. Pages with bespoke API-status boxes
 * (command-framework, state-based, …) keep their own; everything else
 * uses this so the verified-against date is bumped in one place.
 */
export default function AlphaStatusNote() {
  return (
    <Box
      variant="alert-info"
      tag="NOTE · API STATUS"
      title="This is the WPILib 2027 alpha"
    >
      The code on this page targets the WPILib 2027 <em>alpha</em> stack:
      Commands v3 + OpModes (GradleRIO <code>2027.0.0-alpha-6</code>, Phoenix 6{" "}
      <code>26.50.0-alpha-1</code>) on <strong>Java 25</strong> and{" "}
      <strong>SystemCore</strong>: so exact APIs may still shift between alpha
      builds. This page was last verified against alpha-6 in July 2026.
    </Box>
  );
}
