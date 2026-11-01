import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarX2, ClipboardList, MessageSquare } from 'lucide-react';
import { appointmentsAPI } from '../../api/api';
import { useUI } from '../../context/UIContext';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Tabs from '../../components/ui/Tabs';
import EmptyState from '../../components/ui/EmptyState';
import { CardListSkeleton } from '../../components/ui/Loaders';
import { formatDate, formatTimeRange } from '../../utils/format';
import { APPOINTMENT_STATUS, statusMeta } from '../../utils/status';

const TAB_FILTERS = {
  all: () => true,
  confirmed: (a) => a.status === 'CONFIRMED',
  pending: (a) => a.status === 'PENDING_PAYMENT',
  completed: (a) => a.status === 'COMPLETED',
  cancelled: (a) => a.status === 'CANCELLED',
};

const sortKey = (a) => `${a.slotId?.date || ''} ${a.slotId?.startTime || ''}`;

export default function DoctorAppointments() {
  const { toast } = useUI();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const response = await appointmentsAPI.getDoctorAppointments();
        setAppointments(response.data.appointments || []);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Could not load appointments.');
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const counts = useMemo(
    () => Object.fromEntries(Object.entries(TAB_FILTERS).map(([k, fn]) => [k, appointments.filter(fn).length])),
    [appointments]
  );

  const visible = useMemo(
    () => appointments.filter(TAB_FILTERS[tab]).sort((a, b) => sortKey(b).localeCompare(sortKey(a))),
    [appointments, tab]
  );

  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'confirmed', label: 'Confirmed', count: counts.confirmed },
    { id: 'pending', label: 'Awaiting payment', count: counts.pending },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Appointments"
        title="My appointments"
        subtitle="Start consultations and review patient health records."
      />

      <Tabs tabs={tabs} value={tab} onChange={setTab} className="mb-6" />

      {loading ? (
        <CardListSkeleton rows={4} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title={appointments.length === 0 ? 'No appointments yet' : 'Nothing in this view'}
          description={appointments.length === 0 ? 'Once patients book your slots, they will appear here.' : 'Try another tab.'}
          action={appointments.length === 0 && <Button as={Link} to="/doctor/slots">Manage availability</Button>}
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date &amp; time</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((apt) => {
                  const meta = statusMeta(APPOINTMENT_STATUS, apt.status);
                  return (
                    <tr key={apt._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={apt.patientId?.name} size="sm" />
                          <span className="font-medium text-fg">{apt.patientId?.name}</span>
                        </div>
                      </td>
                      <td>
                        <p className="font-medium text-fg">{formatDate(apt.slotId?.date)}</p>
                        <p className="text-xs text-muted">{formatTimeRange(apt.slotId?.startTime, apt.slotId?.endTime)}</p>
                      </td>
                      <td>
                        <Badge tone={meta.tone} dot>{meta.label}</Badge>
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          {apt.status === 'CONFIRMED' && (
                            <Button as={Link} to={`/appointments/${apt._id}/chat`} size="sm" icon={MessageSquare}>
                              Start consultation
                            </Button>
                          )}
                          <Button as={Link} to={`/doctor/patients/${apt.patientId?._id}/health-records`} size="sm" variant="secondary" icon={ClipboardList}>
                            Records
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-line/70 md:hidden">
            {visible.map((apt) => {
              const meta = statusMeta(APPOINTMENT_STATUS, apt.status);
              return (
                <li key={apt._id} className="space-y-3 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={apt.patientId?.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-fg">{apt.patientId?.name}</p>
                      <p className="text-xs text-muted">
                        {formatDate(apt.slotId?.date)} · {formatTimeRange(apt.slotId?.startTime, apt.slotId?.endTime)}
                      </p>
                    </div>
                    <Badge tone={meta.tone} size="sm" dot>{meta.label}</Badge>
                  </div>
                  <div className="flex gap-2">
                    {apt.status === 'CONFIRMED' && (
                      <Button as={Link} to={`/appointments/${apt._id}/chat`} size="sm" icon={MessageSquare} className="flex-1">
                        Start
                      </Button>
                    )}
                    <Button as={Link} to={`/doctor/patients/${apt.patientId?._id}/health-records`} size="sm" variant="secondary" icon={ClipboardList} className="flex-1">
                      Records
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
