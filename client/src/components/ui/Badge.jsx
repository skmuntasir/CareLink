import { cn } from '../../utils/cn';

const TONES = {
  brand: 'bg-brand-500/10 text-brand-text ring-brand-500/25',
  success: 'bg-emerald-500/10 text-emerald-700 ring-emerald-600/20 dark:text-emerald-300 dark:ring-emerald-400/25',
  warning: 'bg-amber-500/10 text-amber-700 ring-amber-600/25 dark:text-amber-300 dark:ring-amber-400/25',
  danger: 'bg-rose-500/10 text-rose-700 ring-rose-600/20 dark:text-rose-300 dark:ring-rose-400/25',
  info: 'bg-sky-500/10 text-sky-700 ring-sky-600/20 dark:text-sky-300 dark:ring-sky-400/25',
  violet: 'bg-violet-500/10 text-violet-700 ring-violet-600/20 dark:text-violet-300 dark:ring-violet-400/25',
  neutral: 'bg-fg/[0.05] text-muted ring-line',
};

const DOTS = {
  brand: 'bg-brand-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  violet: 'bg-violet-500',
  neutral: 'bg-subtle',
};

// Legacy `variant` names are still accepted
const ALIASES = { default: 'brand', secondary: 'neutral' };

const SIZES = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export default function Badge({
  children,
  tone,
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon: Icon,
  className = '',
  ...props
}) {
  const key = ALIASES[tone || variant] || tone || variant;
  const resolved = TONES[key] ? key : 'neutral';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium ring-1 ring-inset',
        TONES[resolved],
        SIZES[size] || SIZES.md,
        className
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', DOTS[resolved])} aria-hidden="true" />}
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      {children}
    </span>
  );
}
