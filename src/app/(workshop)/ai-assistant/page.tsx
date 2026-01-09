"use client";

import { useState, useEffect } from "react";
import * as React from "react";
import { useChat } from "@ai-sdk/react";
import PageTemplate from "@/components/PageTemplate";
import { Send, Sparkles, AlertCircle, ExternalLink, Key } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";

export default function AIAssistantPage() {
  const { theme, systemTheme } = useTheme();
  const currentTheme =
    theme === "system" ? (systemTheme ?? "light") : (theme ?? "light");
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("gemini-api-key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("gemini-api-key", apiKey);
    } else {
      localStorage.removeItem("gemini-api-key");
    }
  }, [apiKey]);

  // AI SDK v5 useChat hook - handles conversation memory automatically!
  // Defaults to /api/chat endpoint
  const { messages, status, error, sendMessage } = useChat({
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(init?.body as string);
      body.customApiKey = apiKey || undefined;
      return fetch(input, {
        ...init,
        body: JSON.stringify(body),
      });
    },
  } as Parameters<typeof useChat>[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== "ready") return;

    sendMessage({ text: input.trim() });
    setInput("");
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <PageTemplate title="AI Workshop Assistant">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div
            className="flex items-center gap-2 mb-2"
            aria-hidden="true"
            role="presentation"
          >
            <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Ask questions about the FRC Programming Workshop. The AI assistant
            has access to all workshop content and remembers your conversation
            history for contextual follow-up questions.
          </p>
        </div>

        <div className="card p-4 mb-4">
          <div className="flex items-start gap-3">
            <Key className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Custom API Key (Optional)
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                By default, the assistant uses the shared API key. Enter your
                own Google Gemini API key to use your personal quota.{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Get an API key
                </a>
              </p>
              <div className="flex gap-2">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="px-3 py-2 text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                >
                  {showApiKey ? "Hide" : "Show"}
                </button>
              </div>
              {apiKey && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  Using custom API key
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card p-4 mb-4 min-h-[400px] max-h-[600px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Sparkles className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Start a conversation
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
                Ask me anything about FRC programming, command-based
                architecture, PID tuning, or any workshop topics! I remember our
                conversation, so feel free to ask follow-up questions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages
                .filter((message) => {
                  // Filter out assistant messages that only have tool calls (no text yet)
                  if (message.role === "assistant") {
                    const hasText = message.parts.some(
                      (part) => part.type === "text" && part.text.trim()
                    );
                    return hasText;
                  }
                  return true;
                })
                .map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-primary-600 text-white"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      <div className="break-words">
                        {message.role === "user" ? (
                          <div className="whitespace-pre-wrap">
                            {message.parts.map((part, index) => {
                              if (part.type === "text") {
                                return <span key={index}>{part.text}</span>;
                              }
                              return null;
                            })}
                          </div>
                        ) : (
                          <div className="prose prose-slate dark:prose-invert max-w-none prose-code:text-primary-600 dark:prose-code:text-primary-400">
                            {(() => {
                              const textContent = message.parts
                                .filter((part) => part.type === "text")
                                .map((part) =>
                                  part.type === "text" ? part.text : ""
                                )
                                .join("");
                              return (
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    code({
                                      inline,
                                      className,
                                      children,
                                      ...props
                                    }: {
                                      inline?: boolean;
                                      className?: string;
                                      children?: React.ReactNode;
                                    }) {
                                      if (inline) {
                                        return (
                                          <code
                                            className="bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded text-sm font-mono"
                                            {...props}
                                          >
                                            {children}
                                          </code>
                                        );
                                      }

                                      return (
                                        <code className={className} {...props}>
                                          {children}
                                        </code>
                                      );
                                    },
                                    pre({
                                      children,
                                    }: {
                                      children?: React.ReactNode;
                                    }) {
                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                      const codeElement = children as any;
                                      const className =
                                        codeElement?.props?.className || "";
                                      const codeChildren =
                                        codeElement?.props?.children || "";

                                      const match = /language-(\w+)/.exec(
                                        className
                                      );

                                      return (
                                        <SyntaxHighlighter
                                          style={
                                            currentTheme === "dark"
                                              ? oneDark
                                              : oneLight
                                          }
                                          language={match ? match[1] : "text"}
                                          PreTag="div"
                                          customStyle={{
                                            margin: "1rem 0",
                                            borderRadius: "0.5rem",
                                            fontSize: "0.875rem",
                                          }}
                                        >
                                          {String(codeChildren).replace(
                                            /\n$/,
                                            ""
                                          )}
                                        </SyntaxHighlighter>
                                      );
                                    },
                                    a({ href, children }) {
                                      return (
                                        <a
                                          href={href}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                                        >
                                          {children}
                                          {href?.startsWith("http") && (
                                            <ExternalLink className="w-3 h-3" />
                                          )}
                                        </a>
                                      );
                                    },
                                  }}
                                >
                                  {textContent}
                                </ReactMarkdown>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                      <div
                        className={`text-xs mt-2 ${
                          message.role === "user"
                            ? "text-primary-100"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                      <span className="text-slate-600 dark:text-slate-300">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Error:</span>
              <span>{error.message}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about subsystems, commands, PID tuning..."
            disabled={status !== "ready"}
            className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={status !== "ready" || !input.trim()}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
      </div>
    </PageTemplate>
  );
}
