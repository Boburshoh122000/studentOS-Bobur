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
      {/* Logo Image */}
      <img
        src="/logo.png"
        alt="StudentOS Logo"
        className={`object-contain flex-shrink-0 ${iconSize}`}
      />
      {/* Text */}
      {!iconOnly && (
        <span className={`font-extrabold tracking-tight ${textColor} ${textSize}`}>StudentOS</span>
      )}
    </div>
  );
}
