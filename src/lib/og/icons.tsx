import { og } from "./theme";

export function Logo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.25" stopColor={og.blue} />
          <stop offset="0.87" stopColor={og.purple} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#g)" />
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

export function Play({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M7 4v16l13-8z" fill="#fff" />
    </svg>
  );
}
