/**
 * DMTrackLogo
 *
 * Concept: document with three text lines + a diagonal pen nib
 * pointing into the bottom-right corner — editorial, sharp, professional.
 *
 * Props:
 *   size  — rendered pixel size (default 32)
 *   color — icon colour (default '#D97706' — site amber accent)
 */
export default function DMTrackLogo({ size = 32, color = '#D97706' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, display: 'block' }}
    >
      {/*
        ── Document body ────────────────────────────────────────────────────────
        Rounded-corner rectangle. Bottom-right corner is open / cut away
        to make room for the pen tip — matches the reference exactly.
        The path leaves a notch by stopping before the bottom-right corner.
      */}
      <path
        d="
          M6 3
          C6 2.448 6.448 2 7 2
          H21
          C21.552 2 22 2.448 22 3
          V22.5
          L18.5 26
          H7
          C6.448 26 6 25.552 6 25
          Z
        "
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/*
        ── Text lines inside document ───────────────────────────────────────────
        Three lines: top two full-width, bottom one shorter.
      */}
      <line x1="10" y1="9"  x2="18" y2="9"  stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="13" x2="18" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="17" x2="15" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />

      {/*
        ── Pen / pencil ─────────────────────────────────────────────────────────
        Angled ~45° pointing into the open bottom-right corner of the doc.

        Anatomy (tip → top, matching reference):
          • Triangular nib tip at bottom-left of the pen shape
          • Straight body along the diagonal
          • A small perpendicular divider line separating body from nib
          • Flat blunt back end at top-right

        Centre axis runs from (22, 28) up to (29, 21).
      */}

      {/* Pen body — outer silhouette as a thin parallelogram */}
      <path
        d="M22.5 27.5 L20.8 29.2 L22.5 30.5 L30 23 L28.3 21.3 Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Nib divider — short perpendicular stroke across the pen axis */}
      <line
        x1="22.8" y1="27.2"
        x2="24.5" y2="25.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Pointed tip — small filled triangle at the very tip */}
      <path
        d="M20.8 29.2 L21.8 27.8 L22.8 29.0 Z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
