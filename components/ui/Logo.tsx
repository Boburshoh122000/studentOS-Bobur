import { memo } from 'react';

/** Brand name constant — change once, reflected everywhere */
const BRAND_NAME = 'StudentOS' as const;

interface LogoProps {
  /** Size classes for the icon box, e.g. "w-8 h-8" */
  iconSize?: string;
  /** Text size class, e.g. "text-xl" */
  textSize?: string;
  /** Override text color (defaults to text-gray-900 in light / text-white in dark) */
  textColor?: string;
  /** Hide the text, show icon only */
  iconOnly?: boolean;
  /** Additional wrapper className */
  className?: string;
}

/**
 * Application logo — optionally renders the brand name beside the icon.
 *
 * @example
 * // Full logo
 * <Logo />
 *
 * @example
 * // Icon only (e.g. collapsed sidebar)
 * <Logo iconOnly />
 */
const Logo = memo(function Logo({
  iconSize = 'w-8 h-8',
  textSize = 'text-xl',
  textColor = 'text-gray-900',
  iconOnly = false,
  className = '',
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Logo Image — mix-blend-multiply removes white bg on light surfaces;
          dark:bg-white/90 + dark:rounded-lg contains the white bg on dark surfaces */}
      <div className={`flex-shrink-0 rounded-lg dark:bg-white/90 dark:p-0.5 ${iconSize}`}>
        <img
          src="/logo.png"
          alt={`${BRAND_NAME} Logo`}
          className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Brand name — hidden when iconOnly is true */}
      {!iconOnly && (
        <span
          className={`font-bold tracking-tight select-none ${textColor} ${textSize}`}
          aria-label={BRAND_NAME}
        >
          {BRAND_NAME}
        </span>
      )}
    </div>
  );
});

Logo.displayName = 'Logo';

export default Logo;
