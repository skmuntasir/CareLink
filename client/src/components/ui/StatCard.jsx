import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Skeleton } from './Loaders';

const TONES = {
  brand: 'bg-brand-500/10 text-brand-text',
  info: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-300',
  danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
};

export default function StatCard({ icon: Icon, label, value, hint, tone = 'brand', loading = false, to, className = '' }) {
  const content = (
    <div
      className={cn(
        'group relative h-full overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-soft transition-all duration-200',
        to && 'hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-lift',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', TONES[tone] || TONES.brand)}>
          {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
        </span>
        {to && (
          <ArrowUpRight
            className="h-4 w-4 text-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-text"
            aria-hidden="true"
          />
        )}
      </div>
      <div className="mt-4">
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="font-display text-3xl font-semibold tabular-nums tracking-tight text-fg">{value}</p>
        )}
        <p className="mt-1 text-sm font-medium text-muted">{label}</p>
        {hint && !loading && <p className="mt-0.5 text-xs text-subtle">{hint}</p>}
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="block h-full rounded-2xl focus-visible:outline-offset-4">
      {content}
    </Link>
  ) : (
    content
  );
}
