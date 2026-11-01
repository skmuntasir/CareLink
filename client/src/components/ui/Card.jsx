import { cn } from '../../utils/cn';

const VARIANTS = {
  default: 'border-line bg-surface shadow-soft',
  glass: 'border-line bg-surface/70 shadow-soft backdrop-blur-xl',
  elevated: 'border-line bg-surface shadow-lift',
  flat: 'border-line bg-surface-2/60',
};

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export default function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hoverable = false,
  ...props
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-200',
        VARIANTS[variant] || VARIANTS.default,
        PADDING[padding] ?? PADDING.md,
        hoverable && 'hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-lift',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Section heading used inside cards
export function CardHeader({ title, subtitle, icon: Icon, action, className = '' }) {
  return (
    <div className={cn('mb-5 flex items-start justify-between gap-4', className)}>
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-text">
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg font-semibold text-fg">{title}</h2>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
