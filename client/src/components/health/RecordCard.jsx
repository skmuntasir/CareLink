import { Activity, Droplet, NotebookText, Ruler, Scale } from 'lucide-react';
import Card from '../ui/Card';
import { formatDate } from '../../utils/format';

function Vital({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface-2/60 px-3.5 py-3">
      <Icon className="h-4 w-4 shrink-0 text-subtle" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-subtle">{label}</p>
        <p className="font-semibold tabular-nums text-fg">{children}</p>
      </div>
    </div>
  );
}

/** One dated health record (used by patient and doctor views). */
export default function RecordCard({ record }) {
  const { bloodPressure, bloodSugar, weight, height, notes } = record;
  const hasBp = bloodPressure?.systolic;
  const anyVital = hasBp || bloodSugar || weight || height;

  return (
    <Card padding="sm" className="sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-display font-semibold text-fg">{formatDate(String(record.date).slice(0, 10))}</p>
        <p className="text-xs text-subtle">
          {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {anyVital && (
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {hasBp && (
            <Vital icon={Activity} label="Blood pressure">
              {bloodPressure.systolic}/{bloodPressure.diastolic} <span className="text-xs font-normal text-subtle">mmHg</span>
            </Vital>
          )}
          {bloodSugar ? (
            <Vital icon={Droplet} label="Blood sugar">
              {bloodSugar} <span className="text-xs font-normal text-subtle">mg/dL</span>
            </Vital>
          ) : null}
          {weight ? (
            <Vital icon={Scale} label="Weight">
              {weight} <span className="text-xs font-normal text-subtle">kg</span>
            </Vital>
          ) : null}
          {height ? (
            <Vital icon={Ruler} label="Height">
              {height} <span className="text-xs font-normal text-subtle">cm</span>
            </Vital>
          ) : null}
        </div>
      )}

      {notes && (
        <div className="mt-3 flex gap-3 rounded-xl border border-line/70 px-3.5 py-3 text-sm text-muted">
          <NotebookText className="mt-0.5 h-4 w-4 shrink-0 text-subtle" aria-hidden="true" />
          <p className="whitespace-pre-line">{notes}</p>
        </div>
      )}
    </Card>
  );
}
