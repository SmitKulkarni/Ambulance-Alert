import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  isPulsing?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  isPulsing = false,
}) => {
  const iconDimensions = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Emblem matching Image 2 & Header Logos */}
      <div className={`relative ${iconDimensions[size]} shrink-0 ${isPulsing ? 'animate-pulse' : ''}`}>
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Medical Cross Outlined Frame */}
          <path
            d="M44 14H76V44H106V76H76V106H44V76H14V44H44V14Z"
            stroke="#DC2626"
            strokeWidth="11"
            strokeLinejoin="miter"
            fill="#FFFFFF"
          />

          {/* Dynamic Diagonal Upward Traffic Corridor Path / Arrow */}
          <path
            d="M20 90C36 78 50 52 82 22L76 18L104 18L104 46L98 40C68 70 54 94 38 104L20 90Z"
            fill="#B91C1C"
          />
          <path
            d="M30 92C44 76 62 48 94 26"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-black tracking-tight text-slate-950 font-['Inter'] ${textSizes[size]}`}>
            AmbuAlert
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-red-600">
            Corridor
          </span>
        </div>
      )}
    </div>
  );
};
