import { Activity, Droplet, Ruler, Scale, Gauge } from 'lucide-react';
import Card from './ui/Card';
import { Skeleton } from './ui/Loaders';
import { bmi, formatDateShort } from '../utils/format';
import { cn } from '../utils/cn';

const TILE_TONES = {
  rose: 'bg-rose-500/10 text-rose-500',
  amber: 'bg-amber-500/10 text-amber-500',
  sky: 'bg-sky-500/10 text-sky-500',
  violet: 'bg-violet-500/10 text-violet-500',
  brand: 'bg-brand-500/10 text-brand-text',
};

function Metric({ icon: Icon, label, value, unit, tone }) {
  const has = value !== '—';
  return (
    <div className="rounded-2xl border border-line bg-surface-2/50 p-4">
      <span className={cn('mb-3 flex h-9 w-9 items-center justify-center rounded-xl', TILE_TONES[tone])}>
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <p className="font-display text-2xl font-semibold tabular-nums text-fg">
        {value}
        {has && unit && <span className="ml-1 text-xs font-medium text-subtle">{unit}</span>}
      </p>
      <p className="mt-0.5 text-xs font-medium text-muted">{label}</p>
    </div>
  );
}

/** Latest-vitals overview. `latestRecord` is the newest HealthRecord (or null). */
export default function HealthSnapshotCard({ latestRecord, loading, title = 'Health snapshot' }) {
  if (loading) {
    return (
      <Card>
        <Skeleton className="mb-5 h-6 w-40" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 !rounded-2xl" />
          ))}
        </div>
      </Card>
    );
  }

  if (!latestRecord) {
    return (
      <Card>
        <h2 className="font-display text-lg font-semibold text-fg">{title}</h2>
        <p className="py-6 text-center text-sm text-muted">No health records yet</p>
      </Card>
    );
  }

  const { bloodPressure, bloodSugar, weight, height } = latestRecord;
  const bp = bloodPressure?.systolic && bloodPressure?.diastolic ? `${bloodPressure.systolic}/${bloodPressure.diastolic}` : '—';
  const bmiValue = bmi(weight, height);

  return (
    <Card>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-fg">{title}</h2>
        <span className="text-xs text-muted">Updated {formatDateShort(latestRecord.date)}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Metric icon={Activity} tone="rose" label="Blood pressure" value={bp} unit="mmHg" />
        <Metric icon={Droplet} tone="amber" label="Blood sugar" value={bloodSugar ? String(bloodSugar) : '—'} unit="mg/dL" />
        <Metric icon={Scale} tone="sky" label="Weight" value={weight ? String(weight) : '—'} unit="kg" />
        <Metric icon={Ruler} tone="violet" label="Height" value={height ? String(height) : '—'} unit="cm" />
        <Metric icon={Gauge} tone="brand" label="BMI" value={bmiValue ? String(bmiValue) : '—'} />
      </div>
    </Card>
  );
}
