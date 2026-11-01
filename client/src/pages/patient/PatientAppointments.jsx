import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarPlus, CalendarX2, CreditCard, Flag, MessageSquare, XCircle } from 'lucide-react';
import { appointmentsAPI, paymentsAPI } from '../../api/api';
import { useUI } from '../../context/UIContext';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import EmptyState from '../../components/ui/EmptyState';
import { CardListSkeleton } from '../../components/ui/Loaders';
import { DateTile } from '../../components/dashboard/AppointmentRow';
import ReportDoctor from '../../components/doctor/ReportDoctor';
import { cleanDoctorName } from '../../utils/doctorUtils';
import { formatDate, formatMoney, formatTimeRange } from '../../utils/format';
import { APPOINTMENT_STATUS, statusMeta } from '../../utils/status';

const TAB_FILTERS = {
  all: () => true,
  upcoming: (a) => ['PENDING_PAYMENT', 'CONFIRMED'].includes(a.status),
  completed: (a) => a.status === 'COMPLETED',
  cancelled: (a) => a.status === 'CANCELLED',
};

const sortKey = (a) => `${a.slotId?.date || ''} ${a.slotId?.startTime || ''}`;

export default function PatientAppointments() {
  const navigate = useNavigate();
  const { toast, confirm } = useUI();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [tab, setTab] = useState('all');
  const [reportTarget, setReportTarget] = useState(null);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentsAPI.getMyAppointments();
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Could not load your appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePayment = async (appointmentId) => {
    setBusyId(appointmentId);
    try {
      const initResponse = await paymentsAPI.initPayment(appointmentId);
      const { txnRef, amount } = initResponse.data.payment;

      // Mock payment confirmation
      const ok = await confirm({
        title: 'Confirm payment',
        message: `Proceed with payment of ${formatMoney(amount)}?`,
        confirmText: `Pay ${formatMoney(amount)}`,
      });
      if (ok) {
        await paymentsAPI.confirmPayment(txnRef);
        toast.success('Payment successful! Your appointment is confirmed.');
        await fetchAppointments();
      }
    } catch (error) {
      toast.error('Payment failed: ' + error.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (id) => {
    const ok = await confirm({
      title: 'Cancel this appointment?',
      message: 'Any refund depends on the cancellation timing policy. This cannot be undone.',
      confirmText: 'Cancel appointment',
      cancelText: 'Keep it',
      tone: 'danger',
    });
    if (!ok) return;

    setBusyId(id);
    try {
      const response = await appointmentsAPI.cancelAppointment(id, { cancelReason: 'Patient cancellation' });
      const refundAmount = response.data.refundAmount || 0;
      toast.success(
        refundAmount > 0
          ? `Appointment cancelled. Refund amount: ${formatMoney(refundAmount)}`
          : 'Appointment cancelled. No refund (within 24h policy).'
      );
      await fetchAppointments();
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(
    () => Object.fromEntries(Object.entries(TAB_FILTERS).map(([key, fn]) => [key, appointments.filter(fn).length])),
    [appointments]
  );

  const visible = useMemo(() => {
    const list = appointments.filter(TAB_FILTERS[tab]);
    // Upcoming reads soonest-first; everything else newest-first
    return [...list].sort((a, b) => (tab === 'upcoming' ? sortKey(a).localeCompare(sortKey(b)) : sortKey(b).localeCompare(sortKey(a))));
  }, [appointments, tab]);

  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Appointments"
        title="My appointments"
        subtitle="Pay, join consultations and manage your bookings."
        actions={
          <Button as={Link} to="/doctors" icon={CalendarPlus}>
            New appointment
          </Button>
        }
      />

      <Tabs tabs={tabs} value={tab} onChange={setTab} className="mb-6" />

      {loading ? (
        <CardListSkeleton rows={3} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title={appointments.length === 0 ? 'No appointments yet' : 'Nothing in this view'}
          description={
            appointments.length === 0
              ? 'Find a verified doctor and book your first consultation.'
              : 'Try another tab to see your other appointments.'
          }
          action={
            appointments.length === 0 && (
              <Button as={Link} to="/doctors">
                Find a doctor
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {visible.map((apt) => {
            const meta = statusMeta(APPOINTMENT_STATUS, apt.status);
            const busy = busyId === apt._id;
            const canReport = ['CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'].includes(apt.status);
            return (
              <Card key={apt._id} padding="sm" className="sm:p-5" hoverable>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-4">
                    <DateTile date={apt.slotId?.date} className="h-16 w-16" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-display text-lg font-semibold text-fg">
                          Dr. {cleanDoctorName(apt.doctorId?.name)}
                        </h3>
                        <Badge tone={meta.tone} dot>
                          {meta.label}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-muted">
                        {formatDate(apt.slotId?.date)} · {formatTimeRange(apt.slotId?.startTime, apt.slotId?.endTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {apt.status === 'PENDING_PAYMENT' && (
                      <Button size="sm" icon={CreditCard} loading={busy} onClick={() => handlePayment(apt._id)}>
                        Pay now
                      </Button>
                    )}
                    {apt.status === 'CONFIRMED' && (
                      <Button size="sm" icon={MessageSquare} onClick={() => navigate(`/appointments/${apt._id}/chat`)}>
                        Start consultation
                      </Button>
                    )}
                    {(apt.status === 'PENDING_PAYMENT' || apt.status === 'CONFIRMED') && (
                      <Button size="sm" variant="danger-soft" icon={XCircle} disabled={busy} onClick={() => handleCancel(apt._id)}>
                        Cancel
                      </Button>
                    )}
                    {canReport && (
                      <Button size="sm" variant="ghost" icon={Flag} onClick={() => setReportTarget(apt)} title="Report this doctor">
                        Report
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {reportTarget && (
        <ReportDoctor
          doctorId={reportTarget.doctorId._id}
          appointmentId={reportTarget._id}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}
