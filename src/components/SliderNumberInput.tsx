"use client";

import { useEffect, useRef, useState } from "react";

interface SliderNumberInputProps {
  value: number;
  min: number;
  max: number;
  step: number;
  precision: number;
  onChange: (v: number) => void;
  /** Accessible name. The visible label stays on the range slider. */
  ariaLabel: string;
  suffix?: string;
}

function formatValue(value: number, precision: number): string {
  return value.toFixed(precision);
}

function parseClamped(
  raw: string,
  min: number,
  max: number,
  precision: number
): number | null {
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed)) return null;
  const clamped = Math.min(max, Math.max(min, parsed));
  return Number(clamped.toFixed(precision));
}

/**
 * Compact numeric field that sits where a slider's read-only chip used to.
 * Draft text is local while focused so typing "1." is not snapped away;
 * Enter / blur commit, Escape reverts, arrows nudge by `step` (Shift = 10%).
 */
export default function SliderNumberInput({
  value,
  min,
  max,
  step,
  precision,
  onChange,
  ariaLabel,
  suffix,
}: SliderNumberInputProps) {
  const formatted = formatValue(value, precision);
  const [draft, setDraft] = useState(formatted);
  const [focused, setFocused] = useState(false);
  const skipCommitRef = useRef(false);

  useEffect(() => {
    if (!focused) setDraft(formatted);
  }, [formatted, focused]);

  const commit = (raw: string) => {
    const next = parseClamped(raw, min, max, precision);
    if (next === null) {
      setDraft(formatted);
      return;
    }
    setDraft(formatValue(next, precision));
    if (next !== value) onChange(next);
  };

  const widthCh = Math.max(
    formatValue(min, precision).length,
    formatValue(max, precision).length,
    4
  );

  return (
    <span className="inline-flex items-baseline gap-0.5">
      <input
        type="text"
        inputMode={min < 0 ? "text" : "decimal"}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={focused ? draft : formatted}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={(e) => {
          setFocused(true);
          setDraft(formatted);
          e.target.select();
        }}
        onBlur={() => {
          if (!skipCommitRef.current) commit(draft);
          skipCommitRef.current = false;
          setFocused(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
            return;
          }
          if (e.key === "Escape") {
            e.preventDefault();
            skipCommitRef.current = true;
            setDraft(formatted);
            e.currentTarget.blur();
            return;
          }
          if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
          e.preventDefault();
          const base = parseClamped(draft, min, max, precision) ?? value;
          const delta = e.shiftKey ? (max - min) / 10 : step;
          const next = Number(
            Math.min(
              max,
              Math.max(min, base + (e.key === "ArrowUp" ? delta : -delta))
            ).toFixed(precision)
          );
          setDraft(formatValue(next, precision));
          if (next !== value) onChange(next);
        }}
        aria-label={ariaLabel}
        className="pid-num"
        style={{ width: `calc(${widthCh}ch + 0.75rem)` }}
      />
      {suffix ? (
        <span className="font-mono text-micro text-[var(--tx2)]">{suffix}</span>
      ) : null}
    </span>
  );
}
