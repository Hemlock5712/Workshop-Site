"use client";
import posthog from "posthog-js";
import { useState, useEffect } from "react";

const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check consent status after component mounts to avoid hydration mismatch
    setShowBanner(posthog.get_explicit_consent_status() === "pending");
  }, []);

  const handleAccept = () => {
    // Enable PostHog tracking
    posthog.opt_in_capturing();
    setShowBanner(false);
  };

  const handleDecline = () => {
    // Disable PostHog tracking
    posthog.opt_out_capturing();
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg2)] border-t border-[var(--rule)] shadow-lg z-50 p-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-[var(--tx2)]">
            We use PostHog analytics with user-identifying features disabled to
            improve our site. Data is aggregated and not used to identify you.
            You can accept or reject analytics.
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          {/* Neither button changes its background on hover. Accept used to go
              `hover:bg-[var(--bg2)]` while keeping `--accent-ink` for its
              label, which put a near-black word on a near-black panel — 1.02:1
              in dark, 1.01:1 in light. The word "Accept" disappeared under the
              cursor, on the first control a first-time visitor ever touches.
              Decline's identical hover was a no-op, because the banner is
              already `--bg2`. The primary dims like the home page's primary
              button; the secondary borrows the topbar search button's hover. */}
          <button
            onClick={handleDecline}
            className="cursor-pointer rounded-md border border-[var(--rule)] px-4 py-2 text-note text-[var(--tx2)] transition-colors hover:border-[var(--accent)] hover:text-[var(--tx)]"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="cursor-pointer rounded-md bg-[var(--accent)] px-4 py-2 text-note font-semibold text-[var(--accent-ink)] transition-opacity hover:opacity-90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
