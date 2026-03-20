'use client';

import { type Locale, localeCountryCodes } from '@/lib/i18n/translations';

interface FlagIconProps {
  locale: Locale;
  size?: number;
  className?: string;
}

/**
 * Renders a country flag as an <img> using flagcdn.com.
 * Works reliably on all platforms (unlike emoji flags on Windows).
 */
export function FlagIcon({ locale, size = 20, className = '' }: FlagIconProps) {
  const code = localeCountryCodes[locale];
  // flagcdn serves w x h PNGs; for flags the ratio is typically 4:3
  const w = size;
  const h = Math.round(size * 0.75);
  return (
    <img
      src={`https://flagcdn.com/${w}x${h}/${code}.png`}
      srcSet={`https://flagcdn.com/${w * 2}x${h * 2}/${code}.png 2x`}
      width={w}
      height={h}
      alt={code.toUpperCase()}
      className={`inline-block rounded-sm ${className}`}
      loading="lazy"
    />
  );
}
