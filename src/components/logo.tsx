/** Show mark: rounded tile with the Bob gradient and a "b" glyph built from strokes. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bwb-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.25" stopColor="#0f62fe" />
          <stop offset="0.87" stopColor="#a56eff" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#bwb-g)" />
      <path
        d="M11 8v16m0-7a5 5 0 1 1 0 .01"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
