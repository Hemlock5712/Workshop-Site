'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * Professional IDE-style code block component
 * Features:
 * - VS Code Dark+ theme for syntax highlighting
 * - macOS-style window controls (optional)
 * - Copy to clipboard functionality
 * - Line numbers
 * - Language badge
 * - Optimized for educational content
 */
interface CodeBlockProps {
  code: string;
  title?: string;
  filename?: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
  hideControls?: boolean;
}

export default function CodeBlock({ 
  code, 
  title, 
  filename, 
  language = 'java',
  className = '',
  showLineNumbers = true,
  hideControls = false
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Custom VS Code Dark+ style optimizations
  const customStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: '#1e1e1e',
      fontSize: '14px',
      lineHeight: '1.5',
      fontFamily: "'Fira Code', 'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace"
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      background: '#1e1e1e',
      fontSize: '14px',
      fontFamily: "'Fira Code', 'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace"
    }
  };

  return (
    <div className={`bg-[#1e1e1e] rounded-lg overflow-hidden shadow-lg border border-gray-700 ${className}`}>
      {(title || filename) && (
        <div className="bg-[#2d2d30] px-4 py-3 border-b border-gray-600 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {filename && !hideControls && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              {title && <span className="text-gray-200 font-medium">{title}</span>}
              {filename && (
                <span className="text-gray-400 text-sm font-mono bg-gray-700 px-2 py-1 rounded">
                  {filename}
                </span>
              )}
              {language && (
                <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded font-medium">
                  {language.toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={copyToClipboard}
            className="text-gray-400 hover:text-gray-200 transition-colors px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm font-medium"
            title="Copy code"
          >
            {copied ? (
              <>
                <span className="text-green-400">✓</span> Copied
              </>
            ) : (
              <>
                <span className="mr-1">📋</span> Copy
              </>
            )}
          </button>
        </div>
      )}
      
      <div className="relative">
        <SyntaxHighlighter
          language={language}
          style={customStyle}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: '#1e1e1e',
            fontSize: '14px',
            lineHeight: '1.5',
            fontFamily: "'Fira Code', 'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace"
          }}
          lineNumberStyle={{
            color: '#6a9955',
            paddingRight: '1rem',
            paddingLeft: '0.5rem',
            userSelect: 'none',
            fontSize: '13px'
          }}
          wrapLines={true}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>
        
        {!title && !filename && (
          <button
            onClick={copyToClipboard}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 transition-colors px-2 py-1 rounded bg-gray-800 bg-opacity-90 text-xs font-medium"
            title="Copy code"
          >
            {copied ? '✓' : '📋'}
          </button>
        )}
      </div>
    </div>
  );
}