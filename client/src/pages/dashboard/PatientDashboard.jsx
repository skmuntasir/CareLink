import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  CalendarPlus,
  CalendarX2,
  CreditCard,
  HeartPulse,
  MessageSquare,
  Pill,
  Stethoscope,
  Star,
} from 'lucide-react';
import { appointmentsAPI, healthRecordsAPI, prescriptionsAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { CardListSkeleton } from '../../components/ui/Loaders';
import AppointmentRow from '../../components/dashboard/AppointmentRow';
import HealthSnapshotCard from '../../components/HealthSnapshotCard';
import { cleanDoctorName } from '../../utils/doctorUtils';
import { firstName, greeting, todayStr } from '../../utils/format';

const QUICK_ACTIONS = [
  { to: '/doctors', label: 'Find a doctor', icon: Stethoscope },
  { to: '/appointments', label: 'My appointments', icon: CalendarCheck },
  { to: '/patient/prescriptions', label: 'Prescriptions', icon: Pill },
  { to: '/health-records', label: 'Add health record', icon: HeartPulse },
  { to: '/patient/reviews', label: 'Rate a doctor', icon: Star },
];

export default function PatientDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ appointments: [], prescriptions: [], records: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Each source is independent — one failing must not blank the page
      const [apts, rx, records] = await Promise.allSettled([
        appointmentsAPI.getMyAppointments(),
        prescriptionsAPI.getMyPrescriptions(),
        healthRecordsAPI.getMyRecords(),
      ]);
      if (cancelled) return;
      setData({
        appointments: apts.status === 'fulfilled' ? apts.value.data.appointments || [] : [],
        prescriptions: rx.status === 'fulfilled' ? rx.value.data.prescriptions || [] : [],
        records: records.status === 'fulfilled' ? records.value.data.records || [] : [],
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { upcoming, awaitingPayment } = useMemo(() => {
    const today = todayStr();
    const active = data.appointments
      .filter((a) => ['CONFIRMED', 'PENDING_PAYMENT'].includes(a.status) && (a.slotId?.date || '') >= today)
      .sort((a, b) =>
        `${a.slotId?.date} ${a.slotId?.startTime}`.localeCompare(`${b.slotId?.date} ${b.slotId?.startTime}`)
      );
    return {
      upcoming: active,
      awaitingPayment: data.appointments.filter((a) => a.status === 'PENDING_PAYMENT').length,
    };
  }, [data.appointments]);

  return (
    <div>
      <PageHeader
        eyebrow="Patient dashboard"
        title={user?.isDemo ? greeting() : `${greeting()}, ${firstName(user?.name)}`}
        subtitle="Here’s an overview of your appointments, prescriptions and health."
        actions={
          <Button as={Link} to="/doctors" icon={CalendarPlus}>
            Book appointment
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Upcoming appointments" value={upcoming.length} loading={loading} to="/appointments" />
        <StatCard icon={CreditCard} tone="warning" label="Awaiting payment" value={awaitingPayment} loading={loading} to="/appointments" />
        <StatCard icon={Pill} tone="violet" label="Prescriptions" value={data.prescriptions.length} loading={loading} to="/patient/prescriptions" />
        <StatCard icon={HeartPulse} tone="info" label="Health records" value={data.records.length} loading={loading} to="/health-records" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            icon={CalendarCheck}
            title="Upcoming appointments"
            subtitle="Your next scheduled consultations"
            action={
              <Link to="/appointments" className="text-sm font-medium text-brand-text hover:underline">
                View all
              </Link>
            }
          />
          {loading ? (
            <CardListSkeleton rows={2} />
          ) : upcoming.length === 0 ? (
            <EmptyState
              compact
              icon={CalendarX2}
              title="No upcoming appointments"
              description="Browse verified doctors and book a time that suits you."
              action={
                <Button as={Link} to="/doctors" size="sm">
                  Find a doctor
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 4).map((apt) => (
                <AppointmentRow
                  key={apt._id}
                  appointment={apt}
                  title={`Dr. ${cleanDoctorName(apt.doctorId?.name)}`}
                  action={
                    apt.status === 'CONFIRMED' ? (
                      <Button as={Link} to={`/appointments/${apt._id}/chat`} size="sm" variant="soft" icon={MessageSquare}>
                        <span className="hidden sm:inline">Consult</span>
                      </Button>
                    ) : (
                      <Button as={Link} to="/appointments" size="sm" variant="warning" icon={CreditCard}>
                        <span className="hidden sm:inline">Pay</span>
                      </Button>
                    )
                  }
                />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Quick actions" subtitle="Jump to what you need" />
          <div className="space-y-1.5">
            {QUICK_ACTIONS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-fg/[0.05]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-fg/[0.05] text-muted transition-colors group-hover:bg-brand-500/10 group-hover:text-brand-text">
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                {label}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <HealthSnapshotCard latestRecord={data.records[0] || null} loading={loading} />
      </div>
    </div>
  );
}
