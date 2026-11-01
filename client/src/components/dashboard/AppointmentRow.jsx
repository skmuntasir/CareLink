import Badge from '../ui/Badge';
import { cn } from '../../utils/cn';
import { dateParts, formatTimeRange } from '../../utils/format';
import { APPOINTMENT_STATUS, statusMeta } from '../../utils/status';

// Calendar-style date tile
export function DateTile({ date, className = '' }) {
  const { day, month } = dateParts(date);
  return (
    <div
      className={cn(
        'flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-brand-500/20 bg-brand-500/10 text-brand-text',
        className
      )}
      aria-hidden="true"
    >
      <span className="text-[10px] font-semibold uppercase leading-none tracking-wider">{month}</span>
      <span className="mt-0.5 font-display text-xl font-semibold leading-none tabular-nums">{day}</span>
    </div>
  );
}

/** Compact appointment line used on dashboards. */
export default function AppointmentRow({ appointment, title, subtitle, action }) {
  const meta = statusMeta(APPOINTMENT_STATUS, appointment.status);
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line/80 bg-surface-2/40 p-3.5 transition-colors hover:border-brand-500/30">
      <DateTile date={appointment.slotId?.date} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-fg">{title}</p>
        <p className="truncate text-sm text-muted">
          {formatTimeRange(appointment.slotId?.startTime, appointment.slotId?.endTime)}
          {subtitle ? ` · ${subtitle}` : ''}
        </p>
      </div>
      <Badge tone={meta.tone} dot className="hidden sm:inline-flex">
        {meta.label}
      </Badge>
      {action}
    </div>
  );
}
