import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ClipboardPlus, FileText, Pill } from 'lucide-react';
import { appointmentsAPI, prescriptionsAPI } from '../../api/api';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import Avatar from '../../components/ui/Avatar';
import Tabs from '../../components/ui/Tabs';
import EmptyState from '../../components/ui/EmptyState';
import { CardListSkeleton } from '../../components/ui/Loaders';
import { DateTile } from '../../components/dashboard/AppointmentRow';
import { formatDate, formatDateShort, formatTime, formatTimeRange } from '../../utils/format';

export default function DoctorPrescriptions() {
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('pending');

  useEffect(() => {
    (async () => {
      try {
        const appointmentsResponse = await appointmentsAPI.getDoctorAppointments();
        const appointments = appointmentsResponse.data.appointments || [];

        const prescriptionsResponse = await prescriptionsAPI.getMyDoctorPrescriptions();
        const prescriptions = prescriptionsResponse.data.prescriptions || [];

        // Appointments that already have a prescription
        const prescribedIds = prescriptions.map((p) => p.appointmentId?._id || p.appointmentId);

        // Pending = COMPLETED appointments with no prescription yet
        const pending = appointments.filter((appt) => {
          const isCompleted = (appt.status || '').toUpperCase().trim() === 'COMPLETED';
          return isCompleted && !prescribedIds.includes(appt._id);
        });

        setPendingAppointments(pending);
        setPrescriptionHistory(prescriptions);
        if (pending.length === 0 && prescriptions.length > 0) setTab('history');
      } catch (err) {
        setError('Failed to load prescription data: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const tabs = useMemo(
    () => [
      { id: 'pending', label: 'Pending', count: pendingAppointments.length },
      { id: 'history', label: 'History', count: prescriptionHistory.length },
    ],
    [pendingAppointments.length, prescriptionHistory.length]
  );

  return (
    <div>
      <PageHeader
        eyebrow="Prescriptions"
        title="Prescriptions"
        subtitle="Write prescriptions for completed consultations and review what you have issued."
      />

      {error && <Alert tone="danger" className="mb-6">{error}</Alert>}

      <Tabs tabs={tabs} value={tab} onChange={setTab} className="mb-6" />

      {loading ? (
        <CardListSkeleton rows={3} />
      ) : tab === 'pending' ? (
        pendingAppointments.length === 0 ? (
          <EmptyState icon={ClipboardPlus} title="No pending prescriptions" description="Completed consultations that still need a prescription will appear here." />
        ) : (
          <div className="space-y-4">
            {pendingAppointments.map((appt) => (
              <Card key={appt._id} padding="sm" className="sm:p-5" hoverable>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-4">
                    <DateTile date={appt.slotId?.date} className="h-16 w-16" />
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-lg font-semibold text-fg">{appt.patientId?.name}</h3>
                      <p className="text-sm text-muted">
                        {formatDate(appt.slotId?.date)} · {formatTimeRange(appt.slotId?.startTime, appt.slotId?.endTime)}
                      </p>
                    </div>
                  </div>
                  <Button as={Link} to={`/doctor/prescriptions/create/${appt._id}`} icon={ClipboardPlus}>
                    Create prescription
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : prescriptionHistory.length === 0 ? (
        <EmptyState icon={Pill} title="No prescription history yet" />
      ) : (
        <div className="space-y-5">
          {prescriptionHistory.map((rx) => (
            <Card key={rx._id} padding="none" className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-2/50 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <Avatar name={rx.patientId?.name} />
                  <div>
                    <h3 className="font-display text-lg font-semibold text-fg">{rx.patientId?.name}</h3>
                    {rx.appointmentId?.slotId && (
                      <p className="flex items-center gap-1.5 text-xs text-muted">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                        Consultation on {formatDate(rx.appointmentId.slotId.date)} at {formatTime(rx.appointmentId.slotId.startTime)}
                      </p>
                    )}
                  </div>
                </div>
                <Badge tone="neutral">Issued {formatDateShort(String(rx.createdAt).slice(0, 10))}</Badge>
              </div>

              <div className="space-y-4 px-5 py-5 sm:px-6">
                <ul className="space-y-2.5">
                  {rx.items.map((item, index) => (
                    <li key={index} className="flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-xl border border-line/80 p-3.5">
                      <span className="flex min-w-[10rem] items-center gap-2.5 font-semibold text-fg">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                          <Pill className="h-4 w-4" aria-hidden="true" />
                        </span>
                        {item.drugName}
                      </span>
                      <span className="text-sm text-muted"><span className="text-subtle">Dosage:</span> {item.dosage}</span>
                      <span className="text-sm text-muted"><span className="text-subtle">Frequency:</span> {item.frequency}</span>
                      <span className="text-sm text-muted"><span className="text-subtle">Duration:</span> {item.duration}</span>
                    </li>
                  ))}
                </ul>
                {rx.additionalNotes && (
                  <div className="flex gap-3 rounded-xl bg-surface-2/60 p-4">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-subtle" aria-hidden="true" />
                    <p className="whitespace-pre-line text-sm text-muted">{rx.additionalNotes}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
