// PLASU Plug mark: a price tag rotated into a "plug" silhouette — a nod
// to "plug" as campus slang for a trusted hookup/seller, and to the tag
// as the marketplace listing itself. Flat, two-color, no gradients.
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#0F7A4D" />
      <g transform="rotate(-45 32 32)">
        <rect x="14" y="25" width="36" height="14" rx="4" fill="#FFFFFF" />
        <circle cx="22" cy="32" r="2.6" fill="#F5A623" />
      </g>
    </svg>
  );
}
