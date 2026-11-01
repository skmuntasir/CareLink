import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Ban,
  Banknote,
  Clock,
  Flag,
  IdCard,
  Mail,
  MessageSquareText,
  Pencil,
  RotateCcw,
  Stethoscope,
} from 'lucide-react';
import { adminAPI } from '../../api/api';
import { useUI } from '../../context/UIContext';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { Stars } from '../../components/ui/Stars';
import { PageLoader } from '../../components/ui/Loaders';
import ReportManageModal from '../../components/admin/ReportManageModal';
import { cleanDoctorName } from '../../utils/doctorUtils';
import { formatDateShort, formatDateTime, formatMoney } from '../../utils/format';
import { REPORT_REASON, REPORT_STATUS, VERIFICATION_STATUS, statusMeta } from '../../utils/status';

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

export default function DoctorDetail() {
  const { doctorUserId } = useParams();
  const { toast, confirm } = useUI();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspending, setSuspending] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ specialization: '', experienceYears: 0, fee: 0, bio: '', licenseNo: '' });
  const [saving, setSaving] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);

  const loadDoctorData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const doctorResponse = await adminAPI.getDoctorById(doctorUserId);
      setDoctor(doctorResponse.data.doctor);
      const reviewsResponse = await adminAPI.getDoctorReviews(doctorUserId);
      setReviews(reviewsResponse.data.reviews || []);
      const reportsResponse = await adminAPI.getDoctorReports(doctorUserId);
      setReports(reportsResponse.data.reports || []);
    } catch (err) {
      setError(err.message || 'Failed to load doctor data');
    } finally {
      setLoading(false);
    }
  }, [doctorUserId]);

  useEffect(() => {
    if (doctorUserId) loadDoctorData();
  }, [doctorUserId, loadDoctorData]);

  const openEdit = () => {
    setEditForm({
      specialization: doctor.specialization || '',
      experienceYears: doctor.experienceYears || 0,
      fee: doctor.fee || 0,
      bio: doctor.bio || '',
      licenseNo: doctor.licenseNo || '',
    });
    setEditOpen(true);
  };

  const setEdit = (field, value) => setEditForm((prev) => ({ ...prev, [field]: value }));

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.specialization.trim() || !editForm.licenseNo.trim()) {
      toast.warning('Specialization and License Number are required.');
      return;
    }
    try {
      setSaving(true);
      await adminAPI.updateDoctorProfile(doctorUserId, {
        ...editForm,
        experienceYears: parseInt(editForm.experienceYears, 10) || 0,
        fee: parseFloat(editForm.fee) || 0,
      });
      toast.success('Doctor profile updated successfully.');
      setEditOpen(false);
      loadDoctorData();
    } catch (err) {
      toast.error('Error updating doctor profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSuspend = async (e) => {
    e?.preventDefault();
    if (!suspendReason.trim()) {
      toast.warning('Please provide a reason for suspension.');
      return;
    }
    try {
      setSuspending(true);
      await adminAPI.suspendDoctor(doctorUserId, { reason: suspendReason });
      toast.success('Doctor suspended.');
      setSuspendReason('');
      setSuspendOpen(false);
      loadDoctorData();
    } catch (err) {
      toast.error(err.message || 'Failed to suspend doctor');
    } finally {
      setSuspending(false);
    }
  };

  const handleUnsuspend = async () => {
    const ok = await confirm({
      title: 'Unsuspend this doctor?',
      message: 'The doctor must have requested re-verification before they can be unsuspended.',
      confirmText: 'Unsuspend',
      tone: 'warning',
    });
    if (!ok) return;

    try {
      await adminAPI.unsuspendDoctor(doctorUserId, { note: 'Doctor unsuspended by admin' });
      toast.success('Doctor unsuspended.');
      loadDoctorData();
    } catch (err) {
      toast.error(err.message || 'Failed to unsuspend doctor');
    }
  };

  if (loading) return <PageLoader label="Loading doctor details…" />;

  if (error) {
    return (
      <div>
        <PageHeader title="Doctor details" back="/admin/manage-doctors" backLabel="Back to doctors" />
        <Alert tone="danger" title="Couldn’t load this doctor" action={<Button size="sm" variant="secondary" onClick={loadDoctorData}>Retry</Button>}>
          {error}
        </Alert>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div>
        <PageHeader title="Doctor details" back="/admin/manage-doctors" backLabel="Back to doctors" />
        <Alert tone="info">Doctor not found.</Alert>
      </div>
    );
  }

  const suspended = Boolean(doctor.user.suspendedAt);
  const verification = statusMeta(VERIFICATION_STATUS, doctor.verificationStatus);

  return (
    <div>
      <PageHeader title="Doctor details" back="/admin/manage-doctors" backLabel="Back to doctors" className="!mb-5" />

      {/* Profile */}
      <Card>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Avatar name={doctor.user.name} size="xl" />
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-semibold text-fg">Dr. {cleanDoctorName(doctor.user.name)}</h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" /> {doctor.user.email}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {suspended ? (
                  <Badge tone="warning" dot size="lg">Suspended</Badge>
                ) : (
                  <Badge tone={verification.tone} dot size="lg">{verification.label}</Badge>
                )}
                {suspended && <span className="text-xs text-muted">since {formatDateTime(doctor.user.suspendedAt)}</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={Pencil} onClick={openEdit}>
              Edit profile
            </Button>
            {suspended ? (
              <Button variant="warning" icon={RotateCcw} onClick={handleUnsuspend}>
                Unsuspend
              </Button>
            ) : (
              <Button variant="danger" icon={Ban} onClick={() => setSuspendOpen(true)}>
                Suspend
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Fact icon={Stethoscope} label="Specialization">{doctor.specialization}</Fact>
          <Fact icon={Clock} label="Experience">{doctor.experienceYears} years</Fact>
          <Fact icon={Banknote} label="Fee">{formatMoney(doctor.fee)}</Fact>
          <Fact icon={IdCard} label="License no.">{doctor.licenseNo}</Fact>
        </div>

        <div className="mt-5">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-subtle">Bio</p>
          <p className="text-sm leading-relaxed text-muted">{doctor.bio}</p>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Reviews */}
        <Card>
          <CardHeader icon={MessageSquareText} title="Reviews" subtitle={`${reviews.length} total`} />
          {reviews.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">No reviews found.</p>
          ) : (
            <ul className="divide-y divide-line/70">
              {reviews.map((review) => (
                <li key={review._id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-fg">{review.patientId?.name}</p>
                      <Stars value={review.rating} className="mt-1" />
                    </div>
                    <span className="text-xs text-subtle">{formatDateShort(String(review.createdAt).slice(0, 10))}</span>
                  </div>
                  {review.comment && <p className="mt-2 text-sm leading-relaxed text-muted">{review.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Reports */}
        <Card padding="none" className="overflow-hidden">
          <div className="p-5 pb-0 sm:p-6 sm:pb-0">
            <CardHeader icon={Flag} title="Reports" subtitle={`${reports.length} total`} />
          </div>
          {reports.length === 0 ? (
            <p className="px-6 pb-8 pt-2 text-center text-sm text-muted">No reports found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => {
                    const reason = statusMeta(REPORT_REASON, report.reason);
                    const status = statusMeta(REPORT_STATUS, report.status);
                    return (
                      <tr key={report._id}>
                        <td className="font-medium text-fg">{report.patientId?.name}</td>
                        <td><Badge tone={reason.tone}>{reason.label}</Badge></td>
                        <td><Badge tone={status.tone} dot>{status.label}</Badge></td>
                        <td className="whitespace-nowrap text-muted">{formatDateShort(String(report.createdAt).slice(0, 10))}</td>
                        <td className="text-right">
                          <Button size="sm" variant="soft" onClick={() => setSelectedReport(report)}>
                            Manage
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Suspend modal */}
      <Modal
        open={suspendOpen}
        onClose={() => !suspending && setSuspendOpen(false)}
        size="sm"
        title="Suspend doctor"
        description="The doctor’s profile will be hidden from patients until it is re-verified."
        footer={
          <>
            <Button variant="secondary" onClick={() => setSuspendOpen(false)} disabled={suspending}>Cancel</Button>
            <Button variant="danger" loading={suspending} onClick={handleSuspend}>Suspend doctor</Button>
          </>
        }
      >
        <Textarea
          label="Reason for suspension"
          required
          rows={3}
          value={suspendReason}
          onChange={(e) => setSuspendReason(e.target.value)}
          placeholder="Please provide a reason…"
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        open={editOpen}
        onClose={() => !saving && setEditOpen(false)}
        size="lg"
        title="Edit doctor profile"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="edit-doctor-form" loading={saving}>Save changes</Button>
          </>
        }
      >
        <form id="edit-doctor-form" onSubmit={handleSaveEdit} className="space-y-4">
          <Input label="Specialization" required value={editForm.specialization} onChange={(e) => setEdit('specialization', e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Experience (years)" type="number" min="0" value={editForm.experienceYears} onChange={(e) => setEdit('experienceYears', e.target.value)} />
            <Input label="Fee (BDT)" type="number" min="0" value={editForm.fee} onChange={(e) => setEdit('fee', e.target.value)} />
          </div>
          <Input label="License number" required value={editForm.licenseNo} onChange={(e) => setEdit('licenseNo', e.target.value)} />
          <Textarea label="Bio" rows={4} value={editForm.bio} onChange={(e) => setEdit('bio', e.target.value)} />
        </form>
      </Modal>

      {selectedReport && (
        <ReportManageModal report={selectedReport} onClose={() => setSelectedReport(null)} onSaved={loadDoctorData} />
      )}
    </div>
  );
}
