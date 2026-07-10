import { BRAND } from "@/lib/brand";

// Estidama AI wordmark: a leaf (sustainability) fused with a neural spark (AI).
// UAE-inspired premium design with red/green/gold palette.
export function Logo({
  className = "",
  showText = true,
  variant = "dark",
}: {
  className?: string;
  showText?: boolean;
  variant?: "dark" | "light";
}) {
  const textColor = variant === "light" ? "#ffffff" : BRAND.colors.ink;
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center">
        <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
          <defs>
            <linearGradient id="estidamaMark" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#CF142B" />
              <stop offset="50%" stopColor="#C8A951" />
              <stop offset="100%" stopColor="#009933" />
            </linearGradient>
          </defs>
          <rect width="40" height="40" rx="12" fill="url(#estidamaMark)" />
          {/* leaf */}
          <path
            d="M12 27c0-8 6-14 15-15-1 9-7 15-15 15z"
            fill="#ffffff"
            opacity="0.95"
          />
          <path d="M13 26c4-5 8-8 13-9" stroke="#007A29" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {/* AI spark node */}
          <circle cx="27.5" cy="13.5" r="3" fill="#ffffff" />
          <circle cx="27.5" cy="13.5" r="1.4" fill="#CF142B" />
        </svg>
      </span>
      {showText && (
        <span className="font-display text-lg font-extrabold tracking-tight" style={{ color: textColor }}>
          Estidama<span style={{ color: BRAND.colors.red }}> AI</span>
        </span>
      )}
    </div>
  );
}

export default Logo;
