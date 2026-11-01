import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function PageHeader({ title, subtitle, eyebrow, actions, back, backLabel = 'Back', className = '' }) {
  const backClasses =
    'mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand-text';
  return (
    <div className={cn('mb-8', className)}>
      {back && typeof back === 'string' && (
        <Link to={back} className={backClasses}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {backLabel}
        </Link>
      )}
      {back && typeof back === 'function' && (
        <button type="button" onClick={back} className={backClasses}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {backLabel}
        </button>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-text">{eyebrow}</p>}
          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
