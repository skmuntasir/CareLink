import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, FileText, Pill, Stethoscope } from 'lucide-react';
import { prescriptionsAPI } from '../../api/api';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { CardListSkeleton } from '../../components/ui/Loaders';
import { cleanDoctorName } from '../../utils/doctorUtils';
import { formatDate, formatDateShort, formatTime } from '../../utils/format';

function Spec({ label, value }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-fg/[0.05] px-2.5 py-1 text-xs">
      <span className="text-subtle">{label}</span>
      <span className="font-medium text-fg">{value}</span>
    </span>
  );
}

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const response = await prescriptionsAPI.getMyPrescriptions();
        setPrescriptions(response.data.prescriptions || []);
      } catch (err) {
        setError('Failed to load prescriptions: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Prescriptions"
        title="My prescriptions"
        subtitle="Medicines prescribed by your doctors after consultations."
        actions={!loading && <Badge tone="brand">{prescriptions.length} total</Badge>}
      />

      {error && <Alert tone="danger" className="mb-6">{error}</Alert>}

      {loading ? (
        <CardListSkeleton rows={2} />
      ) : prescriptions.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No prescriptions yet"
          description="Prescriptions from your doctors will appear here after consultations."
          action={<Button as={Link} to="/doctors">Find a doctor</Button>}
        />
      ) : (
        <div className="space-y-5">
          {prescriptions.map((rx) => {
            const slot = rx.appointmentId?.slotId;
            return (
              <Card key={rx._id} padding="none" className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-2/50 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <Avatar name={rx.doctorId?.name} />
                    <div>
                      <h2 className="font-display text-lg font-semibold text-fg">Dr. {cleanDoctorName(rx.doctorId?.name)}</h2>
                      {slot && (
                        <p className="flex items-center gap-1.5 text-xs text-muted">
                          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                          Consultation on {formatDate(slot.date)} at {formatTime(slot.startTime)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge tone="neutral">Issued {formatDateShort(String(rx.createdAt).slice(0, 10))}</Badge>
                </div>

                <div className="space-y-5 px-5 py-5 sm:px-6">
                  {rx.diagnosis && (
                    <div className="flex gap-3 rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
                      <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-brand-text" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-text">Diagnosis</p>
                        <p className="mt-0.5 text-sm text-fg">{rx.diagnosis}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-subtle">Medicines</h3>
                    <ul className="space-y-3">
                      {rx.items.map((item, index) => (
                        <li key={index} className="flex gap-3 rounded-xl border border-line/80 p-3.5">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                            <Pill className="h-[18px] w-[18px]" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-fg">{item.drugName}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Spec label="Dosage" value={item.dosage} />
                              <Spec label="Frequency" value={item.frequency} />
                              <Spec label="Duration" value={item.duration} />
                            </div>
                            {item.notes && <p className="mt-2 text-sm text-muted">{item.notes}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {rx.additionalNotes && (
                    <div className="flex gap-3 rounded-xl bg-surface-2/60 p-4">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-subtle" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Additional notes</p>
                        <p className="mt-0.5 whitespace-pre-line text-sm text-muted">{rx.additionalNotes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
