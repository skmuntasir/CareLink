import { Inbox } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function EmptyState({ icon: Icon = Inbox, title, description, action, className = '', compact = false }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-line text-center',
        compact ? 'px-4 py-8' : 'px-6 py-14',
        className
      )}
    >
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-text">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h3 className="font-display text-lg font-semibold text-fg">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
