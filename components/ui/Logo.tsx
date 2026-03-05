import React from 'react';

interface LogoProps {
  /** Size classes for the icon box, e.g. "w-8 h-8" */
  iconSize?: string;
  /** Text size class, e.g. "text-xl" */
  textSize?: string;
  /** Override text color (defaults to text-gray-900) */
  textColor?: string;
  /** Hide the text, show icon only */
  iconOnly?: boolean;
  /** Additional wrapper className */
  className?: string;
}

export default function Logo({
  iconSize = 'w-8 h-8',
  textSize = 'text-xl',
  textColor = 'text-gray-900',
  iconOnly = false,
  className = '',
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Blue rounded icon box */}
      <div
        className={`flex items-center justify-center bg-[#3259E8] rounded-2xl text-white flex-shrink-0 ${iconSize}`}
      >
        {/* Graduation cap SVG with tassel */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[58%] h-[58%]"
        >
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
        </svg>
      </div>
      {/* Text */}
      {!iconOnly && (
        <span className={`font-extrabold tracking-tight ${textColor} ${textSize}`}>StudentOS</span>
      )}
    </div>
  );
}
