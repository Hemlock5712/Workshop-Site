"use client";

import React, { Suspense, useState, useEffect } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

interface ModelViewerProps {
  url: string;
  width?: number;
  height?: number;
  className?: string;
}

function GLTFModel({ url, onLoad }: { url: string; onLoad: () => void }) {
  const gltf = useLoader(GLTFLoader, url);

  useEffect(() => {
    if (gltf) {
      onLoad();
    }
  }, [gltf, onLoad]);

  // Center the model
  const scene = gltf.scene.clone();

  // Calculate bounding box to center the model
  const box = new THREE.Box3().setFromObject(scene);
  const center = box.getCenter(new THREE.Vector3());

  // Center the model
  scene.position.sub(center);

  return <primitive object={scene} />;
}

function CameraTracker({
  onPositionChange,
}: {
  onPositionChange: (position: [number, number, number]) => void;
}) {
  useFrame(({ camera }) => {
    const pos = camera.position;
    onPositionChange([
      Math.round(pos.x * 100) / 100,
      Math.round(pos.y * 100) / 100,
      Math.round(pos.z * 100) / 100,
    ]);
  });
  return null;
}

function LoadingFallback() {
  return null; // Canvas fallback must be null or 3D objects only
}

export default function ModelViewer({
  url,
  width = 800,
  height = 600,
  className = "",
}: ModelViewerProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cameraPosition, setCameraPosition] = useState<
    [number, number, number]
  >([100, 489, 530]);

  if (error) {
    return (
      <div
        className={`relative bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-concept-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            3D Model Viewer
          </h3>
          <p className="text-slate-600 dark:text-slate-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-100 dark:bg-slate-800">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-slate-600 dark:text-slate-300 mt-4">
            Loading 3D model...
          </p>
        </div>
      )}
      <Canvas
        camera={{ position: [100, 489, 530], fov: 50 }}
        onError={(error) => {
          console.error("Canvas error:", error);
          setError("Failed to initialize 3D canvas");
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />

        <CameraTracker onPositionChange={setCameraPosition} />

        <Suspense fallback={<LoadingFallback />}>
          <GLTFModel url={url} onLoad={() => setLoading(false)} />
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          target={[0, -100, 0]}
        />
      </Canvas>

      {/* Camera Position Display */}
      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-mono">
        Camera: [{cameraPosition[0]}, {cameraPosition[1]}, {cameraPosition[2]}]
      </div>
    </div>
  );
}
