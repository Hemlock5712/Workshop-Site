import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="mt-12 w-full py-6 text-center text-sm"
      style={{
        borderTop: "1px solid var(--line-soft)",
        background: "var(--bg)",
        color: "var(--fg-dim)",
      }}
    >
      <div className="container mx-auto flex flex-col items-center gap-1.5">
        <span>{`© ${new Date().getFullYear()} Hemlock's Gray Matter`}</span>
        <Link
          href="/privacy"
          className="text-sm underline-offset-2 hover:underline"
          style={{ color: "var(--accent)" }}
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
