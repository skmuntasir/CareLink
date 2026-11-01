import { useEffect, useState } from 'react';
import { BadgeCheck, Banknote, Clock, IdCard, RotateCcw, Save, Stethoscope } from 'lucide-react';
import { doctorAPI } from '../../api/api';
import { useUI } from '../../context/UIContext';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import Avatar from '../../components/ui/Avatar';
import { PageLoader } from '../../components/ui/Loaders';
import DoctorTrustBadge from '../../components/doctor/DoctorTrustBadge';
import { cleanDoctorName } from '../../utils/doctorUtils';
import { VERIFICATION_STATUS, statusMeta } from '../../utils/status';

const EMPTY = { specialization: '', experienceYears: '', fee: '', bio: '', licenseNo: '' };

function StatusNotice({ profile }) {
  switch (profile.verificationStatus) {
    case 'PENDING':
      return <Alert tone="info" title="Awaiting admin verification">An administrator will review your profile shortly.</Alert>;
    case 'VERIFIED':
      return <Alert tone="success" title="Profile verified">You can now receive bookings from patients.</Alert>;
    case 'REJECTED':
      return <Alert tone="danger" title="Profile rejected">{profile.rejectionReason ? `Reason: ${profile.rejectionReason}` : 'Update your details and request re-verification.'}</Alert>;
    case 'SUSPENDED':
      return <Alert tone="warning" title="Profile suspended">Your profile is hidden from patients. Request re-verification once the issue is resolved.</Alert>;
    default:
      return null;
  }
}

export default function DoctorProfile() {
  const { toast } = useUI();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(EMPTY);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await doctorAPI.getMyProfile();
      const p = response.data.profile;
      setProfile(p);
      setFormData({
        specialization: p.specialization,
        experienceYears: p.experienceYears,
        fee: p.fee,
        bio: p.bio,
        licenseNo: p.licenseNo,
      });
    } catch {
      // No profile yet — brand-new doctors start with an empty form
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const set = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await doctorAPI.createProfile({
        ...formData,
        experienceYears: Number(formData.experienceYears),
        fee: Number(formData.fee),
      });
      toast.success('Profile saved successfully! Awaiting admin verification.');
      await fetchProfile();
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRequestReverification = async () => {
    setRequesting(true);
    try {
      await doctorAPI.requestReverification();
      toast.success('Re-verification request sent to admin.');
      await fetchProfile();
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setRequesting(false);
    }
  };

  if (initialLoading) return <PageLoader label="Loading your profile…" />;

  const meta = profile ? statusMeta(VERIFICATION_STATUS, profile.verificationStatus) : null;
  const canRequest = profile && ['SUSPENDED', 'REJECTED'].includes(profile.verificationStatus);

  return (
    <div>
      <PageHeader
        eyebrow="Profile"
        title="Doctor profile"
        subtitle="Keep your professional details accurate — patients see this before booking."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Summary column */}
        <div className="space-y-6 lg:col-span-1">
          {profile ? (
            <Card className="text-center">
              <Avatar name={profile.userId.name} size="xl" className="mx-auto" />
              <h2 className="mt-4 font-display text-xl font-semibold text-fg">Dr. {cleanDoctorName(profile.userId.name)}</h2>
              <p className="text-sm text-muted">{profile.specialization}</p>
              <div className="mt-3 flex justify-center">
                <Badge tone={meta.tone} dot size="lg">{meta.label}</Badge>
              </div>
              <DoctorTrustBadge
                className="mt-4 justify-center"
                rating={profile.avgRating || 0}
                totalReviews={profile.totalReviews || 0}
                experienceYears={profile.experienceYears}
                isVerified={profile.verificationStatus === 'VERIFIED'}
              />
            </Card>
          ) : (
            <Card className="text-center">
              <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-text">
                <Stethoscope className="h-8 w-8" aria-hidden="true" />
              </span>
              <h2 className="font-display text-lg font-semibold text-fg">Set up your profile</h2>
              <p className="mt-1 text-sm text-muted">Fill in the form and submit it for admin verification to start receiving patients.</p>
            </Card>
          )}

          {profile && <StatusNotice profile={profile} />}

          {canRequest && (
            <Card variant="flat">
              <p className="text-sm text-muted">Submit a request to have your profile reviewed again by an administrator.</p>
              <Button className="mt-4 w-full" variant="secondary" icon={RotateCcw} loading={requesting} onClick={handleRequestReverification}>
                Request re-verification
              </Button>
            </Card>
          )}
        </div>

        {/* Form column */}
        <Card className="lg:col-span-2">
          <CardHeader title="Professional details" icon={IdCard} subtitle="Saving sends your profile for verification" />
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Specialization" icon={Stethoscope} required placeholder="e.g. Cardiology" value={formData.specialization} onChange={set('specialization')} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Years of experience" icon={Clock} type="number" min="0" required value={formData.experienceYears} onChange={set('experienceYears')} />
              <Input label="Consultation fee (BDT)" icon={Banknote} type="number" min="0" required value={formData.fee} onChange={set('fee')} />
            </div>
            <Input label="License number" icon={BadgeCheck} required value={formData.licenseNo} onChange={set('licenseNo')} />
            <Textarea label="Bio" required rows={5} placeholder="Tell patients about your background and approach…" value={formData.bio} onChange={set('bio')} />
            <div className="flex justify-end">
              <Button type="submit" size="lg" icon={Save} loading={saving}>
                {saving ? 'Saving…' : 'Save profile'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
