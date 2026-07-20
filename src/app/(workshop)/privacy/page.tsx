import { OptInOutOfCookies } from "@/components/AnalyticsOptInOut";

export default function PrivacyPage() {
  return (
    <div className="container justify-self-center prose dark:prose-invert mb-8">
      <OptInOutOfCookies />

      <h1>Privacy Policy</h1>
      <p>Last updated: 2025-10-07</p>
      <hr />

      <h2>1. Who we are</h2>
      <ul>
        <li>
          Hemlock&apos;s Gray Matter (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
          &ldquo;our&rdquo;)
        </li>
        <li>
          Website: <a href="https://frc5712.com">https://frc5712.com</a>
        </li>
        <li>
          Contact: graymatter@hemlockps.com | 700 N Pine St, Hemlock, MI, 48626,
          USA
        </li>
      </ul>

      <h2>2. Scope</h2>
      <p>
        This policy explains what data we collect when you use frc5712.com, how
        we use it, how we share it, and the choices you have. Our audience is
        primarily in the United States, including FRC teams, with occasional
        international visitors.
      </p>

      <h2>3. What we collect</h2>
      <ul>
        <li>
          <strong>Server logs (essential):</strong> IP address, user agent,
          pages visited, timestamp, referrer, and basic error/performance data.
          Used for security, reliability, and abuse prevention.
        </li>
        <li>
          <strong>Analytics (PostHog, anonymized/aggregated):</strong> Page
          views, events, device/browser context, approximate location
          (city/region if available), and usage metrics. We configure PostHog
          with user-identifying features disabled. We do not use analytics to
          identify or profile individuals.
        </li>
        <li>
          <strong>Optional anonymous surveys (PostHog):</strong> If we run
          surveys, responses are collected without names, emails, or other
          direct identifiers. We avoid sensitive questions and aggregate
          results.
        </li>
      </ul>
      <p>
        We do not collect names, emails, payment details, or precise location.
        We do not have a contact form.
      </p>

      <h2>4. Cookies and similar technologies</h2>
      <ul>
        <li>
          We use a minimal analytics cookie (PostHog) to understand site usage
          and improve the site.
        </li>
        <li>
          We disable user-identifying features (e.g., user IDs, cross-site
          tracking, device fingerprinting). Where available, we anonymize IPs or
          avoid storing them long term.
        </li>
        <li>
          You can reject analytics cookies via our banner or the preferences
          section at the top of the Privacy Policy page, or you can block
          cookies in your browser. Essential cookies (if any) are required for
          core functionality.
        </li>
      </ul>

      <h2>5. How we use information</h2>
      <ul>
        <li>Operate, secure, and maintain the website.</li>
        <li>Monitor performance, debug issues, and prevent abuse.</li>
        <li>
          Generate aggregated, non-identifying statistics to improve content and
          usability.
        </li>
      </ul>
      <p>We do not use data for targeted advertising or user profiling.</p>

      <h2>6. Sharing and disclosures</h2>
      <p>
        We do not sell or share personal information as those terms are defined
        under the California Consumer Privacy Act (CCPA/CPRA).
      </p>
      <p>We may disclose information to:</p>
      <ul>
        <li>
          <strong>Service providers:</strong> PostHog (analytics),
          hosting/CDN/DDoS protection, and error/performance monitoring. These
          providers process data on our behalf under contracts.
        </li>
        <li>
          <strong>Legal/security:</strong> If required by law, or to protect our
          rights, users, or the public.
        </li>
      </ul>

      <h2>7. Children and students</h2>
      <p>
        Our site is for a general audience that may include teens involved in
        FRC. We do not knowingly collect personal information from children
        under 13. If you believe a child under 13 has provided personal
        information, contact us and we will delete it.
      </p>

      <h2>8. Your choices and controls</h2>
      <ul>
        <li>
          <strong>Cookies/analytics:</strong> Use the cookie banner to accept or
          reject analytics. You can also block cookies in your browser.
        </li>
        <li>
          <strong>Do Not Track:</strong> We do not respond to DNT signals due to
          a lack of standardization.
        </li>
        <li>
          <strong>Access/deletion:</strong> If you believe we hold personal
          information about you (e.g., via an inadvertent submission), email us
          at graymatter@hemlockps.com to request access or deletion. We may need
          to verify your request.
        </li>
      </ul>
      <p>
        California residents: We honor applicable rights under the CCPA/CPRA
        (access, correction, deletion, non-discrimination). We do not sell or
        share personal information for cross-context behavioral advertising.
      </p>

      <h2>9. Data retention</h2>
      <ul>
        <li>
          <strong>Server logs:</strong> retained for 30 days for security and
          troubleshooting, then deleted or anonymized.
        </li>
        <li>
          <strong>Analytics (PostHog):</strong> retained for 1 year, aggregated
          where possible, then deleted or further anonymized.
        </li>
        <li>
          <strong>Anonymous survey responses (PostHog):</strong> retained for up
          to 1 year alongside analytics data, then aggregated or deleted.
        </li>
      </ul>

      <h2>10. Security</h2>
      <p>
        We implement reasonable administrative, technical, and physical
        safeguards (e.g., HTTPS/TLS, access controls, least-privilege, audit
        logging). No method of transmission or storage is 100% secure.
      </p>

      <h2>11. International visitors</h2>
      <p>
        Our services are based in the United States (PostHog Cloud US). If you
        access the site from outside the US, your information may be processed
        in the US, which may have different data protection laws than your
        country does.
      </p>

      <h2>12. Third parties and links</h2>
      <p>
        We may link to third-party sites or services. Their privacy practices
        are governed by their own policies. We encourage you to review them. We
        use embedded YouTube videos, which may collect information with their
        own cookies or trackers.
      </p>

      <h2>13. Changes to this policy</h2>
      <p>
        We may update this policy periodically. We will update the &ldquo;Last
        updated&rdquo; date above and, if changes are material, provide
        additional notice (e.g., on-site banner).
      </p>

      <h2>14. Contact</h2>
      <p>Questions, concerns, or rights requests:</p>
      <ul>
        <li>Email: graymatter@hemlockps.com</li>
        <li>
          Postal: Hemlock&apos;s Gray Matter, 700 N Pine St, Hemlock, MI, 48626,
          USA
        </li>
      </ul>

      <p>PostHog configuration details (transparency)</p>
      <ul>
        <li>Deployment: PostHog Cloud US</li>
        <li>
          IP handling: IPs are not retained long term; where supported, IPs are
          anonymized or truncated before storage and used only for approximate
          geolocation and abuse prevention.
        </li>
        <li>
          User identification: Disabled (no user IDs, emails, or device
          fingerprints sent)
        </li>
        <li>Session replay: Disabled</li>
        <li>Cross-site tracking: Disabled</li>
        <li>Data retention in PostHog: 1 year</li>
      </ul>
    </div>
  );
}
