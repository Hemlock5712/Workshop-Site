/**
 * The field coordinate frame, drawn over the season field for `/swerve-basics`.
 *
 * Owner's call, November 2026: one picture of the frame every pose in the
 * course uses, with the axes drawn in and a few labeled points. (0, 0) is the
 * blue corner, bottom left as drawn, because that is what `getPose()`, BLine
 * and LimelightLib report today. Move it when WPILib ships a center origin.
 *
 * `field26.png` has a transparent floor and white lines, so it sits on a
 * `--bg2` panel with a `--tx3` border drawn here, which keeps it legible in
 * both themes. The border was measured off the PNG's alpha channel: the field
 * runs from x 84 to 3424 and y 92 to 1722 in image pixels, 3340 by 1630,
 * which is 16.54 by 8.07 m at 202 px per meter both ways.
 */

const IMG_W = 3508;
const IMG_H = 1814;
const X0 = 84;
const X1 = 3424;
const Y0 = 92;
const Y1 = 1722;
const FIELD_X = 16.54;
const FIELD_Y = 8.07;

/** Meters to image pixels. Y is up in the field and down in the image. */
const px = (x: number) => X0 + (x / FIELD_X) * (X1 - X0);
const py = (y: number) => Y1 - (y / FIELD_Y) * (Y1 - Y0);

const POINTS: {
  x: number;
  y: number;
  label: string;
  anchor: "start" | "end";
}[] = [
  { x: 0, y: 0, label: "(0, 0)", anchor: "start" },
  { x: 8.27, y: 4.04, label: "(8.27, 4.04)", anchor: "start" },
  { x: 2, y: 6.5, label: "(2, 6.5)", anchor: "start" },
  { x: 14.5, y: 1.5, label: "(14.5, 1.5)", anchor: "end" },
];

const LABEL = {
  paintOrder: "stroke",
  stroke: "var(--bg)",
  strokeWidth: 28,
  strokeLinejoin: "round",
} as const;

export default function FieldAxes() {
  const ox = px(0);
  const oy = py(0);
  return (
    <figure className="measure-wide m-0">
      <svg
        viewBox={`0 0 ${IMG_W} ${IMG_H + 120}`}
        role="img"
        aria-label="The field from above, blue alliance on the left. X runs to the right along the field from the blue corner, Y runs up across it. Points marked at (0, 0), the center (8.27, 4.04), (2, 6.5) near the blue wall, and (14.5, 1.5) near the red wall."
        className="block h-auto w-full"
        style={{ background: "var(--bg2)", borderRadius: 3 }}
      >
        <image
          href="/images/planner/field26.png"
          width={IMG_W}
          height={IMG_H}
        />
        <rect
          x={X0}
          y={Y0}
          width={X1 - X0}
          height={Y1 - Y0}
          fill="none"
          stroke="var(--tx3)"
          strokeWidth={8}
        />

        <defs>
          <marker
            id="field-axis-head"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
          </marker>
        </defs>

        {/* +X along the length, +Y across */}
        <line
          x1={ox}
          y1={oy}
          x2={px(5)}
          y2={oy}
          stroke="var(--accent)"
          strokeWidth={22}
          markerEnd="url(#field-axis-head)"
        />
        <line
          x1={ox}
          y1={oy}
          x2={ox}
          y2={py(2.2)}
          stroke="var(--accent)"
          strokeWidth={22}
          markerEnd="url(#field-axis-head)"
        />
        <text
          x={px(5) + 60}
          y={oy - 30}
          fontSize={210}
          fontWeight={700}
          fill="var(--accent)"
          style={LABEL}
        >
          +X
        </text>
        <text
          x={ox + 70}
          y={py(2.2) + 60}
          fontSize={210}
          fontWeight={700}
          fill="var(--accent)"
          style={LABEL}
        >
          +Y
        </text>

        {POINTS.map((p) => (
          <g key={p.label}>
            <circle
              cx={px(p.x)}
              cy={py(p.y)}
              r={46}
              fill="var(--tx)"
              stroke="var(--bg)"
              strokeWidth={12}
            />
            <text
              x={px(p.x) + (p.anchor === "start" ? 70 : -70)}
              y={py(p.y) + (p.y === 0 ? 120 : -60)}
              textAnchor={p.anchor}
              fontSize={150}
              fontFamily="var(--font-mono)"
              fill="var(--tx)"
              style={LABEL}
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
      <figcaption
        className="mt-2"
        style={{ fontSize: "var(--text-note)", color: "var(--tx2)" }}
      >
        Every pose is measured in meters from the blue corner, on both
        alliances.
      </figcaption>
    </figure>
  );
}
