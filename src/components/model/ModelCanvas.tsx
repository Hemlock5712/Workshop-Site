"use client";

/**
 * The three.js half of the model viewer.
 *
 * Split out from `ModelViewer` for one reason: `three`, `@react-three/fiber`
 * and `drei` are ~600 KB of JavaScript, and a static import puts all of it in
 * the route bundle whether or not anyone scrolls to a model. `ModelViewer`
 * imports this file through `next/dynamic`, so the cost is paid on approach.
 *
 * Nothing outside this file may import from `three` — that is the whole point
 * of the boundary.
 */

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  type RefObject,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Html, OrbitControls, useGLTF } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

/** Camera positions the control bar can jump to. Reset is `home`. */
export const VIEWS = {
  home: [80, 650, 380],
  front: [0, 40, 760],
  side: [760, 40, 0],
  top: [0, 760, 1],
} as const;

export type ViewName = keyof typeof VIEWS;

const TARGET: [number, number, number] = [0, 0, 0];

/**
 * Draco decoders, self-hosted from `three/examples/jsm/libs/draco/gltf`.
 *
 * drei defaults to Google's gstatic CDN, which would make the models depend on
 * a third-party host the rest of the site never touches — and fail behind the
 * school firewalls this workshop is usually run on. Copied into `public/draco`
 * instead; `pnpm postinstall` is not wired up for it, so re-copy after a three
 * upgrade if the decoder ever goes out of step with the loader.
 */
const DRACO_PATH = "/draco/";

function Model({ url, onLoaded }: { url: string; onLoaded: () => void }) {
  const gltf = useGLTF(url, DRACO_PATH);

  useEffect(() => {
    onLoaded();
  }, [onLoaded, gltf]);

  return (
    <Center>
      <primitive object={gltf.scene} />
    </Center>
  );
}

/* The site has one loading vocabulary — a quiet mono micro-label — and this is
   it inside the canvas. See the matching label in `GitHubContent`. */
function LoadingFallback() {
  return (
    <Html center>
      <div
        className="mono whitespace-nowrap px-4 py-2.5"
        style={{
          fontSize: "var(--text-micro)",
          letterSpacing: "0.1em",
          background: "var(--bg2)",
          border: "1px solid var(--rule)",
          borderRadius: 3,
          color: "var(--tx3)",
        }}
        aria-live="polite"
      >
        loading 3D model…
      </div>
    </Html>
  );
}

/**
 * Writes the camera position straight into the DOM node.
 *
 * This used to lift the position into React state, which meant a `setState`
 * and a full re-render of the viewer — `<Canvas>` included — on every one of
 * the 60 frames a second an orbit drag produces. The readout is a leaf text
 * node that nothing else depends on, so it does not need to be state at all.
 */
function CameraTracker({
  readout,
}: {
  readout: RefObject<HTMLElement | null>;
}) {
  useFrame(({ camera }) => {
    const node = readout.current;
    if (!node) return;
    const p = camera.position;
    node.textContent = `${Math.round(p.x)}, ${Math.round(p.y)}, ${Math.round(p.z)}`;
  });

  return null;
}

export default function ModelCanvas({
  url,
  view,
  readout,
}: {
  url: string;
  /**
   * The view to sit at. Changing it — including back to a value it already
   * held, via the counter the parent bumps — moves the camera there.
   */
  view: { name: ViewName; nonce: number };
  /** Where `CameraTracker` writes the live position. */
  readout: RefObject<HTMLElement | null>;
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const applyView = useCallback((name: ViewName) => {
    const controls = controlsRef.current;
    const camera = controls?.object;
    if (!controls || !camera) return;
    const [x, y, z] = VIEWS[name];
    camera.position.set(x, y, z);
    controls.target.set(...TARGET);
    controls.update();
  }, []);

  useEffect(() => {
    // One frame's grace: on the first pass the controls exist but the model
    // may not have been centred yet.
    const id = requestAnimationFrame(() => applyView(view.name));
    return () => cancelAnimationFrame(id);
  }, [applyView, view]);

  return (
    <Canvas camera={{ position: [...VIEWS.home], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />

      <Suspense fallback={<LoadingFallback />}>
        <Model url={url} onLoaded={() => applyView(view.name)} />
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

      <CameraTracker readout={readout} />
    </Canvas>
  );
}
