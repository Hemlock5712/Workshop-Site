"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";

interface MarkdownCodeBlockProps {
  className?: string;
  children?: ReactNode;
}

export default function MarkdownCodeBlock({
  className,
  children,
}: MarkdownCodeBlockProps) {
  const { theme, systemTheme } = useTheme();
  const currentTheme =
    theme === "system" ? (systemTheme ?? "light") : (theme ?? "light");
  const match = /language-(\w+)/.exec(className ?? "");

  return (
    <SyntaxHighlighter
      style={currentTheme === "dark" ? oneDark : oneLight}
      language={match ? match[1] : "text"}
      PreTag="div"
      customStyle={{
        margin: "1rem 0",
        borderRadius: "0.5rem",
        fontSize: "0.875rem",
      }}
    >
      {String(children ?? "").replace(/\n$/, "")}
    </SyntaxHighlighter>
  );
}
