import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  CalendarClock,
  CalendarX2,
  ClipboardPlus,
  MessageSquare,
  Pill,
  Star,
  UserCog,
} from 'lucide-react';
import { appointmentsAPI, doctorAPI, prescriptionsAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/ui/EmptyState';
import { CardListSkeleton } from '../../components/ui/Loaders';
import AppointmentRow from '../../components/dashboard/AppointmentRow';
import { cleanDoctorName } from '../../utils/doctorUtils';
import { firstName, greeting, todayStr } from '../../utils/format';

const QUICK_ACTIONS = [
  { to: '/doctor/slots', label: 'Manage availability', icon: CalendarClock },
  { to: '/doctor/appointments', label: 'All appointments', icon: CalendarCheck },
  { to: '/doctor/prescriptions', label: 'Prescriptions', icon: Pill },
  { to: '/doctor/profile', label: 'Edit profile', icon: UserCog },
];

function ProfileNotice({ profile }) {
  const action = (
    <Button as={Link} to="/doctor/profile" size="sm" variant="secondary">
      Go to profile
    </Button>
  );

  if (!profile) {
    return (
      <Alert tone="warning" title="Complete your profile to start receiving patients" action={action} className="mb-6">
        Add your specialization, experience, fee and license number. An administrator will then review and verify your profile.
      </Alert>
    );
  }
  switch (profile.verificationStatus) {
    case 'PENDING':
      return (
        <Alert tone="info" title="Your profile is awaiting verification" className="mb-6">
          An administrator is reviewing your details. You will be notified once you are verified.
        </Alert>
      );
    case 'REJECTED':
      return (
        <Alert tone="danger" title="Your profile was rejected" action={action} className="mb-6">
          {profile.rejectionReason ? `Reason: ${profile.rejectionReason}` : 'Please update your profile and request re-verification.'}
        </Alert>
      );
    case 'SUSPENDED':
      return (
        <Alert tone="warning" title="Your profile is suspended" action={action} className="mb-6">
          You can request re-verification from your profile page.
        </Alert>
      );
    default:
      return null;
  }
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [prof, apts, rx] = await Promise.allSettled([
        doctorAPI.getMyProfile(),
        appointmentsAPI.getDoctorAppointments(),
        prescriptionsAPI.getMyDoctorPrescriptions(),
      ]);
      if (cancelled) return;
      // A missing profile (404) is expected for brand-new doctors
      setProfile(prof.status === 'fulfilled' ? prof.value.data.profile : null);
      setAppointments(apts.status === 'fulfilled' ? apts.value.data.appointments || [] : []);
      setPrescriptions(rx.status === 'fulfilled' ? rx.value.data.prescriptions || [] : []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { upcoming, todayCount, needsRx } = useMemo(() => {
    const today = todayStr();
    const confirmed = appointments
      .filter((a) => a.status === 'CONFIRMED' && (a.slotId?.date || '') >= today)
      .sort((a, b) =>
        `${a.slotId?.date} ${a.slotId?.startTime}`.localeCompare(`${b.slotId?.date} ${b.slotId?.startTime}`)
      );
    const prescribed = new Set(prescriptions.map((p) => p.appointmentId?._id || p.appointmentId));
    return {
      upcoming: confirmed,
      todayCount: appointments.filter((a) => a.slotId?.date === today && ['CONFIRMED', 'COMPLETED'].includes(a.status)).length,
      needsRx: appointments.filter((a) => a.status === 'COMPLETED' && !prescribed.has(a._id)).length,
    };
  }, [appointments, prescriptions]);

  return (
    <div>
      <PageHeader
        eyebrow="Doctor dashboard"
        title={user?.isDemo ? greeting() : `${greeting()}, Dr. ${cleanDoctorName(firstName(user?.name))}`}
        subtitle="Your schedule, consultations and prescriptions at a glance."
        actions={
          <Button as={Link} to="/doctor/slots" icon={CalendarClock}>
            Add availability
          </Button>
        }
      />

      {!loading && <ProfileNotice profile={profile} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Today’s appointments" value={todayCount} loading={loading} to="/doctor/appointments" />
        <StatCard icon={CalendarClock} tone="info" label="Upcoming confirmed" value={upcoming.length} loading={loading} to="/doctor/appointments" />
        <StatCard icon={ClipboardPlus} tone="warning" label="Awaiting prescription" value={needsRx} loading={loading} to="/doctor/prescriptions" />
        <StatCard
          icon={Star}
          tone="violet"
          label="Average rating"
          value={profile ? Number(profile.avgRating || 0).toFixed(1) : '—'}
          hint={profile ? `${profile.totalReviews || 0} reviews` : undefined}
          loading={loading}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            icon={CalendarCheck}
            title="Up next"
            subtitle="Confirmed consultations"
            action={
              <Link to="/doctor/appointments" className="text-sm font-medium text-brand-text hover:underline">
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
              title="No confirmed appointments"
              description="Publish availability slots so patients can book you."
              action={
                <Button as={Link} to="/doctor/slots" size="sm">
                  Manage availability
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 4).map((apt) => (
                <AppointmentRow
                  key={apt._id}
                  appointment={apt}
                  title={apt.patientId?.name || 'Patient'}
                  action={
                    <Button as={Link} to={`/appointments/${apt._id}/chat`} size="sm" variant="soft" icon={MessageSquare}>
                      <span className="hidden sm:inline">Start</span>
                    </Button>
                  }
                />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Quick actions" subtitle="Manage your practice" />
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
    </div>
  );
}
