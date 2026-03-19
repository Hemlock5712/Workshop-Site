"use client";

import React, { useRef } from "react";
import { usePlannerContext } from "@/components/planner/PlannerContext";
import { MOTOR_PRESETS } from "@/lib/planner/types";
import { X, Square, Circle, Pentagon } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { state, actions, loadFieldImage, saveToHistory } = usePlannerContext();
  const fieldImageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFieldWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    actions.setFieldWidth(parseFloat(e.target.value) || 17.55);
    saveToHistory();
  };

  const handleFieldImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await loadFieldImage(file);
      } catch (error) {
        alert("Failed to load image: " + (error as Error).message);
      }
    }
  };

  const handleConfigChange = (field: string, value: number) => {
    actions.updateConfig({ [field]: value });
  };

  const handleMotorPresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value !== "custom") {
      actions.setMotorPreset(e.target.value);
    }
  };

  const handleAddObstacle = (type: "rectangle" | "circle") => {
    actions.addObstacle(type);
    saveToHistory();
    onClose();
  };

  const handleStartPolygon = () => {
    actions.startPolygonDrawing();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--card)] rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--card-foreground)]">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--muted)] rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-[var(--muted-foreground)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Field Settings */}
            <section>
              <h3 className="font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2 mb-3">
                Field Settings
              </h3>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                Field Width (m)
              </label>
              <input
                type="number"
                value={state.fieldWidth}
                onChange={handleFieldWidthChange}
                step="0.01"
                className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm"
              />

              <label className="block text-sm text-[var(--muted-foreground)] mb-1 mt-3">
                Custom Field Image
              </label>
              <input
                ref={fieldImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleFieldImageUpload}
                className="w-full text-sm text-[var(--muted-foreground)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[var(--muted)] file:text-[var(--foreground)] hover:file:bg-[var(--border)]"
              />
            </section>

            {/* Robot Dimensions */}
            <section>
              <h3 className="font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2 mb-3">
                Robot Dimensions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                    Length (m)
                  </label>
                  <input
                    type="number"
                    value={state.config.robotLength}
                    onChange={(e) =>
                      handleConfigChange(
                        "robotLength",
                        parseFloat(e.target.value) || 0.8
                      )
                    }
                    step="0.05"
                    className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                    Width (m)
                  </label>
                  <input
                    type="number"
                    value={state.config.robotWidth}
                    onChange={(e) =>
                      handleConfigChange(
                        "robotWidth",
                        parseFloat(e.target.value) || 0.8
                      )
                    }
                    step="0.05"
                    className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Simulation Physics */}
            <section>
              <h3 className="font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2 mb-3">
                Simulation Physics
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                    Max Velocity (m/s)
                  </label>
                  <input
                    type="number"
                    value={state.config.maxVelocity}
                    onChange={(e) =>
                      handleConfigChange(
                        "maxVelocity",
                        parseFloat(e.target.value) || 4.287
                      )
                    }
                    step="0.1"
                    className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                    Max Friction (G)
                  </label>
                  <input
                    type="number"
                    value={state.config.maxFriction}
                    onChange={(e) =>
                      handleConfigChange(
                        "maxFriction",
                        parseFloat(e.target.value) || 1.0
                      )
                    }
                    step="0.1"
                    className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                    Drive Base Radius (m)
                  </label>
                  <input
                    type="number"
                    value={state.config.driveBaseRadius}
                    onChange={(e) =>
                      handleConfigChange(
                        "driveBaseRadius",
                        parseFloat(e.target.value) || 0.4
                      )
                    }
                    step="0.01"
                    className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Drivetrain */}
            <section>
              <h3 className="font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2 mb-3">
                Drivetrain
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                    Gear Ratio
                  </label>
                  <input
                    type="number"
                    value={state.config.gearRatio}
                    onChange={(e) =>
                      handleConfigChange(
                        "gearRatio",
                        parseFloat(e.target.value) || 6.746
                      )
                    }
                    step="0.01"
                    className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                    Wheel Radius (m)
                  </label>
                  <input
                    type="number"
                    value={state.config.wheelRadius}
                    onChange={(e) =>
                      handleConfigChange(
                        "wheelRadius",
                        parseFloat(e.target.value) || 0.0483
                      )
                    }
                    step="0.001"
                    className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                    Robot Mass (kg)
                  </label>
                  <input
                    type="number"
                    value={state.config.robotMass}
                    onChange={(e) =>
                      handleConfigChange(
                        "robotMass",
                        parseFloat(e.target.value) || 56.7
                      )
                    }
                    step="0.5"
                    className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Motor Parameters */}
            <section>
              <h3 className="font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2 mb-3">
                Motor Parameters
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                    Motor Type
                  </label>
                  <select
                    onChange={handleMotorPresetChange}
                    defaultValue="kraken_foc"
                    className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm"
                  >
                    {Object.entries(MOTOR_PRESETS).map(([key, preset]) => (
                      <option key={key} value={key}>
                        {preset.name}
                      </option>
                    ))}
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                    Stall Torque (N-m)
                  </label>
                  <input
                    type="number"
                    value={state.config.motorStallTorque}
                    onChange={(e) =>
                      handleConfigChange(
                        "motorStallTorque",
                        parseFloat(e.target.value) || 9.3615
                      )
                    }
                    step="0.1"
                    className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                    Free Speed (RPM)
                  </label>
                  <input
                    type="number"
                    value={state.config.motorFreeSpeedRpm}
                    onChange={(e) =>
                      handleConfigChange(
                        "motorFreeSpeedRpm",
                        parseFloat(e.target.value) || 5784.65
                      )
                    }
                    step="10"
                    className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                    Stator Current Limit (A)
                  </label>
                  <input
                    type="number"
                    value={state.config.statorCurrentLimit}
                    onChange={(e) =>
                      handleConfigChange(
                        "statorCurrentLimit",
                        parseFloat(e.target.value) || 150.0
                      )
                    }
                    step="5"
                    className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Tolerances */}
            <section>
              <h3 className="font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2 mb-3">
                Tolerances
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                    Waypoint Tolerance (m)
                  </label>
                  <input
                    type="number"
                    value={state.config.waypointTolerance}
                    onChange={(e) =>
                      handleConfigChange(
                        "waypointTolerance",
                        parseFloat(e.target.value) || 0.15
                      )
                    }
                    step="0.01"
                    className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                    Position Tolerance (m)
                  </label>
                  <input
                    type="number"
                    value={state.config.positionTolerance}
                    onChange={(e) =>
                      handleConfigChange(
                        "positionTolerance",
                        parseFloat(e.target.value) || 0.02
                      )
                    }
                    step="0.01"
                    className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                    Reaction Time (s)
                  </label>
                  <input
                    type="number"
                    value={state.config.reactionTime}
                    onChange={(e) =>
                      handleConfigChange(
                        "reactionTime",
                        parseFloat(e.target.value) || 0.03
                      )
                    }
                    step="0.01"
                    className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Obstacles */}
            <section>
              <h3 className="font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2 mb-3">
                Obstacles
              </h3>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => handleAddObstacle("rectangle")}
                  className="flex-1 flex items-center justify-center gap-2 bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm transition-colors"
                  title="Add Rectangle"
                >
                  <Square className="w-4 h-4" />
                  Box
                </button>
                <button
                  onClick={() => handleAddObstacle("circle")}
                  className="flex-1 flex items-center justify-center gap-2 bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm transition-colors"
                  title="Add Circle"
                >
                  <Circle className="w-4 h-4" />
                  Circle
                </button>
                <button
                  onClick={handleStartPolygon}
                  className="flex-1 flex items-center justify-center gap-2 bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm transition-colors"
                  title="Draw Polygon"
                >
                  <Pentagon className="w-4 h-4" />
                  Poly
                </button>
              </div>

              {/* Obstacle List */}
              <div className="max-h-32 overflow-y-auto bg-[var(--background)] border border-[var(--border)] rounded-md">
                {state.obstacles.length === 0 ? (
                  <div className="p-3 text-center text-sm text-[var(--muted-foreground)]">
                    No obstacles
                  </div>
                ) : (
                  state.obstacles.map((obs, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        actions.selectObstacle(i);
                        onClose();
                      }}
                      className="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-[var(--muted)] border-b border-[var(--border)] last:border-b-0 text-sm"
                    >
                      <span>{obs.name}</span>
                      <span className="text-[var(--muted-foreground)] capitalize">
                        {obs.type}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
