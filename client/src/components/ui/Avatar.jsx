import { cn } from '../../utils/cn';
import { initials } from '../../utils/format';

const SIZES = {
  xs: 'h-7 w-7 text-[11px] rounded-lg',
  sm: 'h-9 w-9 text-xs rounded-xl',
  md: 'h-11 w-11 text-sm rounded-xl',
  lg: 'h-14 w-14 text-lg rounded-2xl',
  xl: 'h-24 w-24 text-3xl rounded-3xl',
};

// Every avatar (real users and demo users) uses the same neon brand colour as the primary buttons.
export default function Avatar({ name = '', size = 'md', className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center bg-gradient-to-b from-brand-400 to-brand-500 font-semibold text-ink-950',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_20px_-8px_rgba(0,217,149,0.65)]',
        SIZES[size] || SIZES.md,
        className
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
