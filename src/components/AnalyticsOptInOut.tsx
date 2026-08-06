"use client";
import posthog from "posthog-js";
import { useState, useEffect } from "react";

type ConsentStatus = ReturnType<typeof posthog.get_explicit_consent_status>;

/**
 * Component to allow users to opt in or out of cookies.
 *
 * Designed for the privacy page.
 */
export function OptInOutOfCookies() {
  const [consentGiven, setConsentGiven] = useState<ConsentStatus | null>(null);

  useEffect(() => {
    // Check current consent status
    const currentConsent = posthog.get_explicit_consent_status();
    setConsentGiven(currentConsent);
  }, []);

  const handleOptIn = () => {
    posthog.opt_in_capturing();
    setConsentGiven("granted");
  };

  const handleOptOut = () => {
    posthog.opt_out_capturing();
    setConsentGiven("denied");
  };

  if (consentGiven === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col border border-[var(--rule)] rounded-lg p-2 mb-8">
      <span className="text-aside font-bold">Cookie Preferences</span>
      <div className="flex flex-row items-center justify-between gap-2 w-full">
        <span>
          {consentGiven === "granted" && "You have opted in to cookies."}
          {consentGiven === "denied" && "You have opted out of cookies."}
          {consentGiven === "pending" &&
            "We use cookies to enhance the experience of teams using this site."}
        </span>
        <div className="flex flex-row items-center gap-2">
          {consentGiven === "granted" && (
            <button
              onClick={handleOptOut}
              className="px-4 py-2 border border-[var(--rule)] text-[var(--tx2)] rounded hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              Opt Out of Analytics Cookies
            </button>
          )}
          {consentGiven === "denied" && (
            <button
              onClick={handleOptIn}
              className="px-4 py-2 border border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)] rounded hover:opacity-90 transition-colors cursor-pointer"
            >
              Opt In to Analytics Cookies
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
