import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const BASE =
  'inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-all duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ' +
  'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';

const VARIANTS = {
  primary:
    'bg-gradient-to-b from-brand-400 to-brand-500 text-ink-950 font-semibold ' +
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_20px_-8px_rgba(0,217,149,0.65)] hover:from-brand-300 hover:to-brand-400',
  secondary: 'border border-line bg-surface-2 text-fg hover:bg-fg/[0.06]',
  outline: 'border border-brand-500/50 text-brand-text hover:bg-brand-500/10',
  ghost: 'text-muted hover:bg-fg/[0.06] hover:text-fg',
  soft: 'bg-brand-500/10 text-brand-text hover:bg-brand-500/20',
  danger: 'bg-rose-600 text-white shadow-[0_8px_20px_-10px_rgba(225,29,72,0.7)] hover:bg-rose-500',
  'danger-soft': 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-300',
  warning: 'bg-amber-500 text-ink-950 font-semibold hover:bg-amber-400',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500',
};

const SIZES = {
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-[13px]',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-xl px-6 text-base',
  icon: 'h-9 w-9 rounded-xl',
};

export default function Button({
  as: Component = 'button',
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  icon: Icon,
  ...props
}) {
  const isNativeButton = Component === 'button';
  return (
    <Component
      {...(isNativeButton ? { type, disabled: disabled || loading } : {})}
      aria-busy={loading || undefined}
      className={cn(BASE, VARIANTS[variant] || VARIANTS.primary, SIZES[size] || SIZES.md, className)}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {children}
    </Component>
  );
}
