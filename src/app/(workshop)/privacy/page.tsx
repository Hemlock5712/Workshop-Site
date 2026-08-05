import { OptInOutOfCookies } from "@/components/AnalyticsOptInOut";

export default function PrivacyPage() {
  return (
    <div className="container justify-self-center prose dark:prose-invert mb-8">
      <OptInOutOfCookies />

      <h1>Privacy Policy</h1>
      <p>Last updated: 2026-08-02</p>
      <hr />

      <h2>The short version</h2>
      <ul>
        <li>
          No accounts, no sign-in, no ads, no payments. We never ask you for
          your name or your email.
        </li>
        <li>
          We count page views with PostHog. You can turn its cookie off in the
          box at the top of this page.
        </li>
        <li>
          Videos load from YouTube and code loads from GitHub, so those
          companies see that you opened the page.
        </li>
        <li>
          Your lesson check marks stay in your browser. We never see them.
        </li>
      </ul>
      <p>
        Some answers below say <strong>TODO(verify)</strong>. Those are things
        we have not confirmed yet. We would rather leave a gap here than write a
        promise we cannot back up.
      </p>

      <h2>1. Who we are</h2>
      <p>
        This site is run by Hemlock&apos;s Gray Matter, 700 N Pine St, Hemlock,
        MI 48626, USA. This policy covers{" "}
        <a href="https://frc5712.com">frc5712.com</a> and nothing else.
        Questions go to graymatter@hemlockps.com.
      </p>

      <h2>2. The Feedback button opens a Google Form</h2>
      <p>
        The <strong>Feedback</strong> button in the header opens a form hosted
        by Google Forms. That form is not part of this site. Whatever you type
        into it goes to Google and then to us, so leave personal details out of
        it.
      </p>
      <p>
        <strong>TODO(verify):</strong> which fields that form asks for, and
        whether it records the Google account of the person submitting it.
      </p>

      <h2>3. Analytics (PostHog)</h2>
      <p>
        We use PostHog to see which pages people read and which ones they give
        up on. PostHog runs in your browser. Its requests leave through
        frc5712.com/events, which forwards them to PostHog&apos;s servers in the
        United States.
      </p>
      <p>PostHog records:</p>
      <ul>
        <li>Page views, and which links and buttons you click.</li>
        <li>
          Your browser, your operating system, your screen size, and the page
          you arrived from.
        </li>
        <li>
          Your IP address, which PostHog uses to work out a rough city or
          region.
        </li>
        <li>
          JavaScript errors: the error message, the file that threw it, and the
          page you were on. We turned this on so broken pages get found and
          fixed.
        </li>
      </ul>
      <p>
        We never call PostHog&apos;s identify function, so none of this is
        attached to a name, an email, or an account. There are none to attach.
      </p>
      <p>
        <strong>About the cookie.</strong> Analytics starts when a page loads,
        before you answer the banner. If you accept, PostHog stores a cookie and
        a small amount of browser storage so it can tell that several page views
        came from one visit. If you decline, PostHog keeps counting page views
        but stops using cookies and browser storage on your machine altogether;
        its servers work out a temporary, privacy-preserving identifier instead.
        Declining changes what gets stored on your device. It does not switch
        analytics off.
      </p>
      <p>
        <strong>TODO(verify):</strong> how long PostHog keeps this data, and
        whether session replay and surveys are turned on. Those are settings on
        our PostHog account rather than in the site code, and the site code
        neither turns them on nor off. An earlier version of this page said
        replay was off and data was kept for one year; we could not confirm
        either, so both claims are gone.
      </p>

      <h2>4. Hosting, server logs, and two more trackers</h2>
      <p>
        The site is hosted on Vercel. Every page you open passes through
        Vercel&apos;s servers, which keep ordinary web server logs: your IP
        address, the page you asked for, the time, and the version string your
        browser sends.
      </p>
      <p>
        Every page also loads <strong>Vercel Analytics</strong> and{" "}
        <strong>Vercel Speed Insights</strong>. The first counts page views. The
        second measures how fast pages load and draw on your device. Both run on
        every page, and the cookie banner does not control them &mdash; it
        controls PostHog only.
      </p>
      <p>
        <strong>TODO(verify):</strong> how long Vercel keeps server logs for
        this project, and whether Vercel Analytics stores anything in your
        browser.
      </p>

      <h2>5. Videos and code come from other companies</h2>
      <ul>
        <li>
          <strong>YouTube.</strong> Several lessons embed a YouTube player. The
          player loads from youtube.com as soon as the page opens, so Google
          sees your IP address and can set its own cookies whether or not you
          press play.
        </li>
        <li>
          <strong>{"GitHub. "}</strong> Pages that show workshop code fetch the
          file from GitHub&apos;s public API while you read, straight from your
          browser. GitHub sees that request.
        </li>
      </ul>
      <p>
        What those companies do with what they see is covered by their privacy
        policies, not by this one.
      </p>

      <h2>6. What stays in your browser</h2>
      <p>
        Your lesson check marks and anything you build in the season planner are
        saved in your browser&apos;s local storage. They never reach our server,
        they are not tied to you, and clearing your browser data deletes them.
        Open the site on a different computer and they will not be there.
      </p>

      <h2>7. What we do not do</h2>
      <ul>
        <li>No accounts, no passwords, no payments.</li>
        <li>
          No advertising, and no selling or sharing of personal information as
          the California privacy laws (CCPA/CPRA) define those words.
        </li>
        <li>No profiles of individual readers.</li>
        <li>
          No response to Do Not Track browser signals, because there is no
          agreed standard for what a site should do with them.
        </li>
      </ul>

      <h2>8. Younger readers</h2>
      <p>
        This site is written for middle and high school students, so some
        readers will be under 13. We do not ask anyone for personal information
        and we do not knowingly collect it. If you think a reader under 13 typed
        personal information into the feedback form, email us. We will delete
        anything we hold and ask Google to do the same.
      </p>

      <h2>9. Where the data goes</h2>
      <p>
        Our hosting and our analytics run on servers in the United States. If
        you read this site from another country, your information is processed
        in the US.
      </p>

      <h2>10. Your choices</h2>
      <ul>
        <li>
          <strong>The analytics cookie:</strong> use the Cookie Preferences box
          at the top of this page, or the banner at the bottom of the screen.
          You can also block cookies in your browser.
        </li>
        <li>
          <strong>Access or deletion:</strong> email graymatter@hemlockps.com.
          Tell us roughly when you visited and what you typed, and we will look.
          We may need to ask a question or two to find it.
        </li>
      </ul>
      <p>
        California residents have rights under the CCPA/CPRA to access, correct,
        and delete personal information, and not to be treated differently for
        asking. The email address above is how you use them.
      </p>

      <h2>11. Security</h2>
      <p>
        The site is served over HTTPS. No website is completely secure, and we
        are not going to claim otherwise.
      </p>

      <h2>12. Changes to this policy</h2>
      <p>
        We update this page when the site changes. The date at the top tells you
        when it last changed. If we add something that sends your data somewhere
        new, this page changes first.
      </p>

      <h2>13. Contact</h2>
      <ul>
        <li>Email: graymatter@hemlockps.com</li>
        <li>
          Post: Hemlock&apos;s Gray Matter, 700 N Pine St, Hemlock, MI, 48626,
          USA
        </li>
      </ul>
    </div>
  );
}
