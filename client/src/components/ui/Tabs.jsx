import { cn } from '../../utils/cn';

// Pill-style segmented control. tabs: [{ id, label, count?, icon? }]
export default function Tabs({ tabs, value, onChange, className = '' }) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border border-line bg-surface-2/70 p-1',
        className
      )}
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all',
              active ? 'bg-surface text-fg shadow-soft ring-1 ring-line' : 'text-muted hover:text-fg'
            )}
          >
            {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
            {tab.label}
            {typeof tab.count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
                  active ? 'bg-brand-500/15 text-brand-text' : 'bg-fg/[0.06] text-subtle'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
