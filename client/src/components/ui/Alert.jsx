import { AlertTriangle, CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const TONES = {
  success: {
    icon: CheckCircle2,
    box: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  danger: {
    icon: XCircle,
    box: 'border-rose-500/25 bg-rose-500/10 text-rose-800 dark:text-rose-200',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  warning: {
    icon: AlertTriangle,
    box: 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    icon: Info,
    box: 'border-sky-500/25 bg-sky-500/10 text-sky-800 dark:text-sky-200',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
};

export default function Alert({ tone = 'info', title, children, onClose, action, className = '' }) {
  const t = TONES[tone] || TONES.info;
  const Icon = t.icon;
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-xl border px-4 py-3 text-sm', t.box, className)}
    >
      <Icon className={cn('mt-0.5 h-[18px] w-[18px] shrink-0', t.iconColor)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5 opacity-90')}>{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="-mr-1 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
