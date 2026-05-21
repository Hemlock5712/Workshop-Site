"use client";

import dynamic from "next/dynamic";

const CodeBlockClient = dynamic(() => import("./CodeBlockClient"), {
  ssr: false,
  loading: () => (
    <div className="bg-[#1e1e1e] rounded-lg overflow-hidden shadow-lg border border-gray-700">
      <div className="flex items-center justify-center h-24">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
      </div>
    </div>
  ),
});

export default CodeBlockClient;
