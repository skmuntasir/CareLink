import { useEffect, useState } from 'react';
import { Ban, BadgeCheck, Banknote, CheckCircle2, Clock, IdCard, RefreshCw, Stethoscope, XCircle } from 'lucide-react';
import { adminAPI } from '../../api/api';
import { useUI } from '../../context/UIContext';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import { CardListSkeleton } from '../../components/ui/Loaders';
import { cleanDoctorName } from '../../utils/doctorUtils';
import { formatDateTime, formatMoney } from '../../utils/format';

function Fact({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface-2/60 px-3.5 py-3">
      <Icon className="h-4 w-4 shrink-0 text-subtle" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-subtle">{label}</p>
        <p className="truncate font-medium text-fg">{children}</p>
      </div>
    </div>
  );
}

export default function VerifyDoctors() {
  const { toast, confirm, prompt } = useUI();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const fetchPendingDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getPendingDoctors();
      setDoctors(response.data.doctors || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err.message || 'Failed to load pending doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const handleVerify = async (doctorUserId, status, reason = '') => {
    setBusyId(doctorUserId);
    try {
      await adminAPI.verifyDoctor(doctorUserId, { status, rejectionReason: reason });
      toast.success(`Doctor ${status.toLowerCase()} successfully!`);
      await fetchPendingDoctors();
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (doctorUserId) => {
    const reason = await prompt({
      title: 'Reject doctor',
      message: 'The doctor will see this reason and can request re-verification.',
      label: 'Rejection reason',
      placeholder: 'e.g. License number could not be verified',
      confirmText: 'Reject doctor',
      required: true,
      tone: 'danger',
    });
    if (reason) handleVerify(doctorUserId, 'REJECTED', reason);
  };

  const handleSuspend = async (doctorUserId) => {
    const ok = await confirm({
      title: 'Suspend this doctor?',
      message: 'Their profile will be hidden from patients until it is re-verified.',
      confirmText: 'Continue',
      tone: 'warning',
    });
    if (!ok) return;

    const reason = await prompt({
      title: 'Suspension reason',
      label: 'Reason (optional)',
      placeholder: 'Doctor suspended by admin',
      confirmText: 'Suspend doctor',
      tone: 'warning',
    });
    if (reason === null) return; // cancelled

    setBusyId(doctorUserId);
    try {
      // The API expects the field to be named `reason`
      await adminAPI.suspendDoctor(doctorUserId, { reason: reason || 'Doctor suspended by admin' });
      toast.success('Doctor suspended successfully!');
      await fetchPendingDoctors();
    } catch (err) {
      toast.error('Error suspending doctor: ' + err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Verify doctors"
        subtitle="Review professional details before doctors become visible to patients."
        actions={
          <>
            {!loading && !error && (
              <Badge tone={doctors.length ? 'warning' : 'success'} size="lg" dot>
                {doctors.length} pending
              </Badge>
            )}
            <Button variant="secondary" icon={RefreshCw} onClick={fetchPendingDoctors} disabled={loading}>
              Refresh
            </Button>
          </>
        }
      />

      {error && (
        <Alert
          tone="danger"
          title="Couldn’t load the queue"
          className="mb-6"
          action={<Button size="sm" variant="secondary" onClick={fetchPendingDoctors}>Retry</Button>}
        >
          {error}
        </Alert>
      )}

      {loading && doctors.length === 0 ? (
        <CardListSkeleton rows={3} />
      ) : doctors.length === 0 && !error ? (
        <EmptyState icon={CheckCircle2} title="All caught up" description="There are no doctors waiting for verification." />
      ) : (
        <div className="space-y-5">
          {doctors.map((doctor) => {
            const busy = busyId === doctor.userId._id;
            return (
              <Card key={doctor._id}>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-4">
                      <Avatar name={doctor.userId.name} size="lg" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-display text-xl font-semibold text-fg">Dr. {cleanDoctorName(doctor.userId.name)}</h2>
                          {doctor.reverificationRequestedAt && (
                            <Badge tone="warning" icon={RefreshCw}>Re-verification</Badge>
                          )}
                        </div>
                        <p className="truncate text-sm text-muted">{doctor.userId.email}</p>
                        {doctor.reverificationRequestedAt && (
                          <p className="mt-1 text-xs text-subtle">Requested {formatDateTime(doctor.reverificationRequestedAt)}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <Fact icon={Stethoscope} label="Specialization">{doctor.specialization}</Fact>
                      <Fact icon={Clock} label="Experience">{doctor.experienceYears} years</Fact>
                      <Fact icon={Banknote} label="Fee">{formatMoney(doctor.fee)}</Fact>
                      <Fact icon={IdCard} label="License no.">{doctor.licenseNo}</Fact>
                    </div>

                    <div className="mt-4">
                      <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-subtle">Bio</p>
                      <p className="text-sm leading-relaxed text-muted">{doctor.bio}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-row gap-2 lg:w-44 lg:flex-col">
                    <Button className="flex-1 lg:flex-none" variant="success" icon={BadgeCheck} disabled={busy} onClick={() => handleVerify(doctor.userId._id, 'VERIFIED')}>
                      Verify
                    </Button>
                    <Button className="flex-1 lg:flex-none" variant="danger-soft" icon={XCircle} disabled={busy} onClick={() => handleReject(doctor.userId._id)}>
                      Reject
                    </Button>
                    <Button className="flex-1 lg:flex-none" variant="secondary" icon={Ban} disabled={busy} onClick={() => handleSuspend(doctor.userId._id)}>
                      Suspend
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

