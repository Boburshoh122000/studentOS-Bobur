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
          viewBox="0 0 256 256"
          fill="currentColor"
          className="w-[58%] h-[58%]"
        >
          <path d="M176,207.24a119,119,0,0,0,16-7.73V240a8,8,0,0,1-16,0Zm11.76-88.43-56-29.87a8,8,0,0,0-7.52,14.12L171,128l17-9.06Zm64-29.87-120-64a8,8,0,0,0-7.52,0l-120,64a8,8,0,0,0,0,14.12L32,117.87v48.42a15.91,15.91,0,0,0,4.06,10.65C49.16,191.53,78.51,216,128,216a130,130,0,0,0,48-8.76V130.67L171,128l-43,22.93L43.83,106l0,0L25,96,128,41.07,231,96l-18.78,10-.06,0L188,118.94a8,8,0,0,1,4,6.93v73.64a115.63,115.63,0,0,0,27.94-22.57A15.91,15.91,0,0,0,224,166.29V117.87l27.76-14.81a8,8,0,0,0,0-14.12Z" />
        </svg>
      </div>
      {/* Text */}
      {!iconOnly && (
        <span className={`font-extrabold tracking-tight ${textColor} ${textSize}`}>StudentOS</span>
      )}
    </div>
  );
}
