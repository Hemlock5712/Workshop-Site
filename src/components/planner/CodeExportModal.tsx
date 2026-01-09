"use client";

import React, { useMemo } from "react";
import { usePlannerContext } from "./PlannerContext";
import { X, Copy, Check } from "lucide-react";
import { resolveWaypointData } from "@/lib/planner/physics";

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CodeExportModal({ isOpen, onClose }: CodeExportModalProps) {
  const { state } = usePlannerContext();
  const [copied, setCopied] = React.useState(false);

  const javaCode = useMemo(() => {
    let code = "public class Waypoints {\n";

    // Export Linked Waypoints first
    const linkedNames = Object.keys(state.linkedWaypoints);
    if (linkedNames.length > 0) {
      code += "  /* Linked Waypoints */\n";
      linkedNames.forEach((name) => {
        const data = state.linkedWaypoints[name];
        const safeName = name.replace(/\s+/g, "_").toUpperCase();
        code += `  public static final Pose2d ${safeName} = new Pose2d(${data.x.toFixed(
          3
        )}, ${data.y.toFixed(3)}, Rotation2d.fromDegrees(${Math.round(
          data.rot
        )}));\n`;
      });
      code += "\n";
    }

    // Export Path-specific Waypoints
    code += "  /* Path Specific Waypoints */\n";
    Object.values(state.paths).forEach((path) => {
      code += `  // Path: ${path.name}\n`;
      path.points.forEach((wp) => {
        if (!wp.isLinked) {
          const safeName = wp.name.replace(/\s+/g, "_").toUpperCase();
          code += `  public static final Pose2d ${safeName} = new Pose2d(${wp.x.toFixed(
            3
          )}, ${wp.y.toFixed(3)}, Rotation2d.fromDegrees(${Math.round(
            wp.rot
          )}));\n`;
        }
      });
    });

    code += "\n  /* Path Arrays */\n";
    Object.entries(state.paths).forEach(([id, path]) => {
      const safeName = path.name.replace(/\s+/g, "_").toUpperCase();
      const waypointNames = path.points.map((wp) =>
        wp.name.replace(/\s+/g, "_").toUpperCase()
      );
      code += `  public static final Pose2d[] ${safeName} = new Pose2d[] {\n`;
      waypointNames.forEach((name, i) => {
        code += `    ${name}${i < waypointNames.length - 1 ? "," : ""}\n`;
      });
      code += "  };\n";
    });

    code += "}";
    return code;
  }, [state.paths, state.linkedWaypoints]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(javaCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--card)] rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--card-foreground)]">
            Export Java Code
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                copied
                  ? "bg-green-600 text-white"
                  : "bg-primary-500 hover:bg-primary-600 text-white"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--muted)] rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-[var(--muted-foreground)]" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4">
          <pre className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 text-sm font-mono text-green-400 overflow-x-auto whitespace-pre">
            {javaCode}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--muted-foreground)]">
            Copy this code into your FRC robot project. Make sure to import{" "}
            <code className="bg-[var(--muted)] px-1 rounded">Pose2d</code> and{" "}
            <code className="bg-[var(--muted)] px-1 rounded">Rotation2d</code>{" "}
            from WPILib.
          </p>
        </div>
      </div>
    </div>
  );
}
