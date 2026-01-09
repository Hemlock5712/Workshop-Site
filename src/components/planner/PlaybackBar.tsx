"use client";

import React from "react";
import { usePlannerContext } from "./PlannerContext";
import { Play, Pause } from "lucide-react";

export function PlaybackBar() {
  const { state, playbackTime, setPlaybackTime, isPlaying, togglePlay } =
    usePlannerContext();

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaybackTime(parseFloat(e.target.value));
  };

  return (
    <div className="h-14 bg-[var(--card)] border-t border-[var(--border)] px-4 flex items-center gap-4 z-40">
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="w-10 h-10 flex items-center justify-center rounded-md bg-primary-500 hover:bg-primary-600 text-white transition-colors"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" />
        )}
      </button>

      {/* Time Display */}
      <span className="font-mono text-sm text-[var(--muted-foreground)] min-w-[100px]">
        {playbackTime.toFixed(1)}s / {state.totalDuration.toFixed(1)}s
      </span>

      {/* Time Slider */}
      <input
        type="range"
        min="0"
        max={state.totalDuration || 1}
        step="0.1"
        value={playbackTime}
        onChange={handleSliderChange}
        className="flex-1 h-2 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer accent-primary-500"
      />

      {/* Stats Display */}
      <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
        <span>
          Path:{" "}
          <span className="text-[var(--foreground)]">
            {state.pathLength.toFixed(2)}m
          </span>
        </span>
        {state.collisionDetected && (
          <span className="text-red-500 font-medium flex items-center gap-1">
            <span>⚠️</span> Collision
          </span>
        )}
      </div>
    </div>
  );
}
