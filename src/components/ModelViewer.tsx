"use client";

import {
  forwardRef,
  Suspense,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Html, OrbitControls, useGLTF } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

interface ModelViewerProps {
  url: string;
  width?: number;
  height?: number;
  className?: string;
}

export interface ModelViewerRef {
  resetCamera: () => void;
}

interface ModelViewerPropsWithReset extends ModelViewerProps {
  showResetButton?: boolean;
}

const DEFAULT_CAMERA_POSITION: [number, number, number] = [80, 650, 380];
const DEFAULT_TARGET: [number, number, number] = [0, 0, 0];

function Model({ url, onLoaded }: { url: string; onLoaded: () => void }) {
  const gltf = useGLTF(url);

  useEffect(() => {
    onLoaded();
  }, [onLoaded, gltf]);

  return (
    <Center>
      <primitive object={gltf.scene} />
    </Center>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 bg-[var(--card)]/90 text-[var(--foreground)] px-6 py-4 rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--accent)]" />
        <p className="text-sm font-medium">Loading 3D model…</p>
      </div>
    </Html>
  );
}

function CameraTracker({
  onPositionChange,
}: {
  onPositionChange: (position: [number, number, number]) => void;
}) {
  useFrame(({ camera }) => {
    const next: [number, number, number] = [
      Math.round(camera.position.x * 100) / 100,
      Math.round(camera.position.y * 100) / 100,
      Math.round(camera.position.z * 100) / 100,
    ];

    onPositionChange(next);
  });

  return null;
}

const ModelViewer = forwardRef<ModelViewerRef, ModelViewerPropsWithReset>(
  function ModelViewer(
    { url, width, height, className = "", showResetButton = false },
    ref
  ) {
    const controlsRef = useRef<OrbitControlsImpl | null>(null);
    const [cameraPosition, setCameraPosition] = useState<
      [number, number, number]
    >(DEFAULT_CAMERA_POSITION);

    const handleCameraPositionUpdate = useCallback(
      (next: [number, number, number]) => {
        setCameraPosition((prev) =>
          prev[0] === next[0] && prev[1] === next[1] && prev[2] === next[2]
            ? prev
            : next
        );
      },
      []
    );

    const applyDefaultCamera = useCallback(() => {
      const controls = controlsRef.current;
      const camera = controls?.object;
      if (!controls || !camera) {
        return;
      }

      camera.position.set(
        DEFAULT_CAMERA_POSITION[0],
        DEFAULT_CAMERA_POSITION[1],
        DEFAULT_CAMERA_POSITION[2]
      );
      controls.target.set(
        DEFAULT_TARGET[0],
        DEFAULT_TARGET[1],
        DEFAULT_TARGET[2]
      );
      controls.update();
      handleCameraPositionUpdate(DEFAULT_CAMERA_POSITION);
    }, [handleCameraPositionUpdate]);

    const handleModelLoaded = useCallback(() => {
      applyDefaultCamera();
    }, [applyDefaultCamera]);

    useImperativeHandle(ref, () => ({
      resetCamera: applyDefaultCamera,
    }));

    useEffect(() => {
      const id = requestAnimationFrame(() => applyDefaultCamera());
      return () => cancelAnimationFrame(id);
    }, [applyDefaultCamera, url]);

    const containerStyle = useMemo(
      () => ({
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
      }),
      [width, height]
    );

    return (
      <div
        className={`relative bg-[var(--bg2)] rounded-lg overflow-hidden ${className}`}
        style={containerStyle}
      >
        <Canvas camera={{ position: DEFAULT_CAMERA_POSITION, fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />

          <Suspense fallback={<LoadingFallback />}>
            <Model url={url} onLoaded={handleModelLoaded} />
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            enablePan
            enableZoom
            enableRotate
            makeDefault
            minDistance={150}
            maxDistance={1500}
          />

          <CameraTracker onPositionChange={handleCameraPositionUpdate} />
        </Canvas>

        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-mono">
          Camera: [{cameraPosition[0]}, {cameraPosition[1]}, {cameraPosition[2]}
          ]
        </div>

        {showResetButton && (
          <button
            type="button"
            onClick={applyDefaultCamera}
            className="absolute top-2 right-2 bg-[var(--bg2)] hover:bg-[var(--accent)] text-[var(--accent-ink)] text-xs px-3 py-1 rounded font-medium transition-colors"
            title="Reset camera to default position"
          >
            Reset View
          </button>
        )}
      </div>
    );
  }
);

export default ModelViewer;
