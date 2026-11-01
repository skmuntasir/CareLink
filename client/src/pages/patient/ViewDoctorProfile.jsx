import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Award, BadgeCheck, Banknote, CalendarPlus, Clock, IdCard, MessageSquareText, Stethoscope } from 'lucide-react';
import { doctorAPI, reviewsAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/ui/EmptyState';
import { Stars } from '../../components/ui/Stars';
import { Skeleton } from '../../components/ui/Loaders';
import DoctorTrustBadge from '../../components/doctor/DoctorTrustBadge';
import BookingModal from '../../components/doctor/BookingModal';
import { cleanDoctorName } from '../../utils/doctorUtils';
import { formatDateShort, formatMoney, initials } from '../../utils/format';
import { VERIFICATION_STATUS, statusMeta } from '../../utils/status';

function Detail({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fg/[0.05] text-muted">
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-subtle">{label}</p>
        <p className="mt-0.5 break-words font-medium text-fg">{children}</p>
      </div>
    </div>
  );
}

export default function ViewDoctorProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const response = await doctorAPI.getDoctorById(id);
        if (cancelled) return;
        setDoctor(response.data.doctor);

        // Reviews are a nice-to-have — don't fail the whole page without them
        try {
          const rev = await reviewsAPI.getDoctorReviews(id);
          if (!cancelled) setReviews(rev.data.reviews || []);
        } catch (revErr) {
          console.error('Error loading reviews:', revErr);
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load doctor profile: ' + err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div>
        <Skeleton className="mb-6 h-5 w-32" />
        <Skeleton className="h-64 !rounded-3xl" />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 !rounded-2xl lg:col-span-2" />
          <Skeleton className="h-64 !rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div>
        <PageHeader title="Doctor profile" back="/doctors" backLabel="Back to doctors" />
        {error ? <Alert tone="danger">{error}</Alert> : <EmptyState icon={Stethoscope} title="Doctor profile not found" />}
      </div>
    );
  }

  const verification = statusMeta(VERIFICATION_STATUS, doctor.verificationStatus);
  const name = doctor.userId?.name || '';
  const canBook = user?.role === 'PATIENT' && doctor.verificationStatus === 'VERIFIED';

  return (
    <div>
      <PageHeader title="Doctor profile" back="/doctors" backLabel="Back to doctors" className="!mb-5" />

      {/* Hero */}
      <Card padding="none" className="overflow-hidden">
        <div className="relative h-28 bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 sm:h-32">
          <div className="bg-grid absolute inset-0 opacity-50" aria-hidden="true" />
        </div>
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Avatar name={name} size="xl" className="ring-4 ring-surface" />
              <div className="pb-1">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
                  Dr. {cleanDoctorName(name)}
                </h1>
                <p className="mt-0.5 text-muted">{doctor.specialization}</p>
              </div>
            </div>
            {canBook && (
              <Button size="lg" icon={CalendarPlus} onClick={() => setBooking(true)}>
                Book appointment
              </Button>
            )}
          </div>

          <DoctorTrustBadge
            className="mt-5"
            rating={doctor.avgRating || 0}
            totalReviews={doctor.totalReviews || 0}
            experienceYears={doctor.experienceYears}
            isVerified={doctor.verificationStatus === 'VERIFIED'}
          />
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="About" icon={Stethoscope} />
            <p className="whitespace-pre-line leading-relaxed text-muted">{doctor.bio || 'This doctor has not added a bio yet.'}</p>
          </Card>

          <Card>
            <CardHeader
              title="Patient reviews"
              icon={MessageSquareText}
              subtitle={`${doctor.totalReviews || reviews.length || 0} total`}
            />
            {reviews.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No reviews yet.</p>
            ) : (
              <ul className="divide-y divide-line/70">
                {reviews.map((review) => (
                  <li key={review._id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fg/[0.06] text-xs font-semibold text-muted">
                      {initials(review.patientId?.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-fg">{review.patientId?.name || 'Patient'}</p>
                        <span className="text-xs text-subtle">{formatDateShort(String(review.createdAt).slice(0, 10))}</span>
                      </div>
                      <Stars value={review.rating} className="mt-1" />
                      {review.comment && <p className="mt-2 text-sm leading-relaxed text-muted">{review.comment}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader title="Consultation" />
            <p className="font-display text-3xl font-semibold text-fg">{formatMoney(doctor.fee)}</p>
            <p className="mt-1 text-sm text-muted">per online consultation</p>
            {canBook && (
              <Button className="mt-5 w-full" icon={CalendarPlus} onClick={() => setBooking(true)}>
                View available slots
              </Button>
            )}
          </Card>

          <Card>
            <CardHeader title="Professional details" />
            <div className="space-y-5">
              <Detail icon={Stethoscope} label="Specialization">{doctor.specialization}</Detail>
              <Detail icon={Clock} label="Experience">{doctor.experienceYears} years</Detail>
              <Detail icon={IdCard} label="License number">{doctor.licenseNo}</Detail>
              <Detail icon={BadgeCheck} label="Verification">
                <Badge tone={verification.tone} dot>{verification.label}</Badge>
              </Detail>
              <Detail icon={Banknote} label="Fee">{formatMoney(doctor.fee)}</Detail>
              <Detail icon={Award} label="Rating">
                {Number(doctor.avgRating || 0).toFixed(1)} / 5
              </Detail>
            </div>
          </Card>
        </aside>
      </div>

      {booking && <BookingModal doctor={doctor} onClose={() => setBooking(false)} />}
    </div>
  );
}
