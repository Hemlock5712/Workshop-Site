"use client";

import dynamic from "next/dynamic";

const CodeBlockClient = dynamic(() => import("./CodeBlockClient"), {
  ssr: false,
  loading: () => (
    <div
      className="overflow-hidden rounded-md"
      style={{
        background: "var(--bg)",
        border: "1px solid var(--line-soft)",
      }}
    >
      <div className="flex h-24 items-center justify-center">
        <div
          className="h-6 w-6 animate-spin rounded-full border-b-2"
          style={{ borderBottomColor: "var(--accent)" }}
        />
      </div>
    </div>
  ),
});

export default CodeBlockClient;
