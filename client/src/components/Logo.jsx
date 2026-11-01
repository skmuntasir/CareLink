import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';

/**
 * CareLink logo: heart-link mark + "CareLink" wordmark.
 *
 * size:    'sm' | 'md' | 'lg' | 'xl'
 * stacked: mark above the wordmark (hero use)
 * onDark:  force a light wordmark (use on always-dark surfaces)
 * to:      route to link to (omit for a plain, non-clickable logo)
 */
const SIZES = {
  sm: { mark: 'h-7 w-7', text: 'text-xl', gap: 'gap-2' },
  md: { mark: 'h-9 w-9', text: 'text-2xl', gap: 'gap-2.5' },
  lg: { mark: 'h-16 w-16', text: 'text-4xl', gap: 'gap-3' },
  xl: { mark: 'h-28 w-28', text: 'text-5xl', gap: 'gap-4' },
};

export function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <img
      src="/logo-mark.png"
      alt=""
      aria-hidden="true"
      draggable="false"
      className={cn('select-none object-contain drop-shadow-[0_0_14px_rgba(0,217,149,0.45)]', className)}
    />
  );
}

export function Wordmark({ className = 'text-2xl', onDark = false }) {
  return (
    <span className={cn('font-brand font-semibold leading-none tracking-tight', className)}>
      <span className={onDark ? 'text-white' : 'text-fg'}>Care</span>
      <span className={onDark ? 'text-brand-400' : 'text-brand-text'}>Link</span>
    </span>
  );
}

export default function Logo({ size = 'md', stacked = false, onDark = false, to, className = '' }) {
  const s = SIZES[size] || SIZES.md;
  const content = (
    <span className={cn('inline-flex items-center', stacked && 'flex-col', s.gap, className)} aria-label="CareLink">
      <LogoMark className={s.mark} />
      <Wordmark className={s.text} onDark={onDark} />
    </span>
  );

  return to ? (
    <Link to={to} className="inline-flex items-center rounded-lg">
      {content}
    </Link>
  ) : (
    content
  );
}
