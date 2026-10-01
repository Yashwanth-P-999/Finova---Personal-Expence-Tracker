import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  collapsed?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  collapsed = false,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  const brandTextSize = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl sm:text-3xl',
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Bespoke Architectural Emblem */}
      <div
        className={`${iconDimensions} rounded-xl bg-gradient-to-br from-[#AF6E4D] via-[#A05E3C] to-[#864828] text-white flex items-center justify-center shadow-xs shrink-0 relative overflow-hidden group`}
      >
        {/* Subtle fine interior architectural foil line */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_70%)]" />

        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-white/95 relative z-10"
        >
          {/* Architectural Minimalist Interlocking F & Wealth Monogram */}
          <path
            d="M8 6H24M8 6V26M8 15H21M8 6H10"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="21" cy="15" r="2" fill="currentColor" />
          <circle cx="24" cy="6" r="2" fill="currentColor" />
          <path
            d="M15 26L24 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="1 3"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Editorial Luxury Typography */}
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-heading font-extrabold tracking-tight text-[#181512] dark:text-[#FAF7F2] ${brandTextSize}`}
            >
              Finova
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#AF6E4D] dark:bg-[#C87D55]" />
          </div>
          {showTagline && (
            <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#7A6B58] dark:text-[#A89F94] mt-1 font-semibold">
              Personal Finance & Wealth Ledger
            </span>
          )}
        </div>
      )}
    </div>
  );
};
