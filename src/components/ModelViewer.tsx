"use client";

/**
 * A mechanism, in 3D, with a control bar under it.
 *
 * This file deliberately imports nothing from `three`. It owns the frame, the
 * approach gate and the controls; `ModelCanvas` owns the scene and is pulled
 * in through `next/dynamic` the first time the viewer comes near the viewport.
 * Before that the page costs nothing for a model nobody has scrolled to — and
 * /mechanism-cad has two of them.
 *
 * The controls sit in a bar rather than floating over the model. Four overlay
 * chips would occlude the thing they exist to look at, and at a phone's touch
 * sizes they would have to be bigger than the model is tall. The bar also
 * gives the view presets somewhere legible to live, which is what makes this
 * usable without a mouse: orbit is a drag gesture and has no keyboard
 * equivalent, so the four angles a student actually needs are buttons.
 */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { ViewName } from "@/components/model/ModelCanvas";

const ModelCanvas = dynamic(() => import("@/components/model/ModelCanvas"), {
  ssr: false,
});

interface ModelViewerProps {
  url: string;
  /** Accessible name — what this model is. Required: a canvas has no alt text. */
  label: string;
  className?: string;
  /** Approximate download, e.g. `1.6 MB`. Shown before the model is fetched. */
  weight?: string;
}

const VIEW_LABELS: ReadonlyArray<{ name: ViewName; label: string }> = [
  { name: "home", label: "Reset" },
  { name: "front", label: "Front" },
  { name: "side", label: "Side" },
  { name: "top", label: "Top" },
];

export default function ModelViewer({
  url,
  label,
  className = "",
  weight,
}: ModelViewerProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const [near, setNear] = useState(false);
  // A nonce rather than a bare name, so pressing Reset twice from a dragged
  // camera moves it back both times.
  const [view, setView] = useState<{ name: ViewName; nonce: number }>({
    name: "home",
    nonce: 0,
  });

  // Mount the scene once the viewer is within a screen of the viewport. The
  // `rootMargin` is what keeps this from reading as lazy: by the time the
  // model is on screen it has usually already started decoding.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { root: document.getElementById("main-content"), rootMargin: "100% 0px" }
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="measure-wide">
      <div
        ref={frameRef}
        role="img"
        aria-label={`${label}, an interactive 3D model. Use the view buttons below to change angle.`}
        className={`relative overflow-hidden ${className}`.trim()}
        style={{
          background: "var(--bg2)",
          border: "1px solid var(--rule)",
          borderBottom: "none",
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
        }}
      >
        {near ? (
          <ModelCanvas url={url} view={view} readout={readoutRef} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span
              className="mono"
              style={{
                fontSize: "var(--text-micro)",
                letterSpacing: "0.1em",
                color: "var(--tx3)",
              }}
            >
              {weight ? `3D model · ${weight}` : "3D model"}
            </span>
          </div>
        )}
      </div>

      <div
        className="flex flex-wrap items-center gap-tight px-3 py-2"
        style={{
          background: "var(--bg2)",
          border: "1px solid var(--rule)",
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
        }}
      >
        <span className="micro mr-1 hidden sm:inline">View</span>
        {VIEW_LABELS.map((v) => (
          <button
            key={v.name}
            type="button"
            onClick={() =>
              setView((p) => ({ name: v.name, nonce: p.nonce + 1 }))
            }
            className="mono flex min-h-11 cursor-pointer items-center px-3 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] sm:min-h-0 sm:py-1.5"
            style={{
              fontSize: "var(--text-micro)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              border: "1px solid var(--rule)",
              borderRadius: 2,
              background: "var(--bg)",
              color: "var(--tx2)",
            }}
          >
            {v.label}
          </button>
        ))}

        {/* Live telemetry for a sighted reader orienting themselves. It changes
            every frame, so it is hidden from assistive tech — announcing three
            numbers sixty times a second is not information. */}
        <span
          aria-hidden="true"
          className="mono tabular ml-auto hidden whitespace-nowrap md:inline"
          style={{ fontSize: "var(--text-micro)", color: "var(--tx3)" }}
        >
          <span className="micro mr-1.5">Camera</span>
          <span ref={readoutRef}>—</span>
        </span>
      </div>
    </div>
  );
}
