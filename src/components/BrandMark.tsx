type BrandMarkProps = {
  className?: string;
  animate?: boolean;
};

// Bare bridge-mark SVG (no wordmark, no link). Used inside BrandLogo for
// navbar/footer and directly in the homepage hero at a larger size. Stroke
// follows `currentColor` so the parent's text-* utility decides the color.
// When `animate` is true, the path traces itself via the .brand-mark-path
// class defined in globals.css — pure CSS, no client component required.
export default function BrandMark({
  className = "h-7 w-auto",
  animate = true,
}: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 880 384"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <path
        d="M29.51 299.67C194.67 207.57 262.71 103.99 297.34 24.78c-6.97 94.32-7.86 175.44-13.16 270.06 19.89-7.69 43.5-.08 63.48-6.98-4.61-87.38-9.27-174.75-13.76-262.15-4.83-.8-7.25-1.22-12.08-2.09-.11 44.58 1.1 89.22 2.02 133.76-5.99 1.79-11.98 3.61-17.97 5.47-.55-46.15-1.44-92.44-.76-138.6 70.45 162.78 179.23 135.33 226.64 54.85-2.92 46.6-4.98 93.36-7.93 139.96 13.98-2.45 27.97-4.75 41.96-6.88-2.36-44.04-5.13-87.99-7.52-132.02-2.36-1.58-3.53-2.38-5.89-3.96-.81 22.87-1.46 45.76-2.09 68.66l-12.17 2.6c-.09 0-2.9-71.76-2.9-71.76.09-.03 16.23 26.64 25.08 36.45 38.26 42.41 80.89 55.57 122.36 61.81-30.57-6.52-69.77-15.37-100.52-17.12-155.1-8.81-294.34 15.8-471.38 161.8.01 14.39 1.33 34.24 3.25 48.93C373.52 109.21 647.11 152.79 827.64 223.45"
        className={animate ? "stroke-current brand-mark-path" : "stroke-current"}
        pathLength={1}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
