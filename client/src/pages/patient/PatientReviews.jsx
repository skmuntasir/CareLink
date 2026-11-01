import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquareText, PenLine, Star } from 'lucide-react';
import { appointmentsAPI, reviewsAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Avatar from '../../components/ui/Avatar';
import Tabs from '../../components/ui/Tabs';
import EmptyState from '../../components/ui/EmptyState';
import { Stars } from '../../components/ui/Stars';
import { CardListSkeleton } from '../../components/ui/Loaders';
import { DateTile } from '../../components/dashboard/AppointmentRow';
import { cleanDoctorName } from '../../utils/doctorUtils';
import { formatDateShort, formatTimeRange } from '../../utils/format';

export default function PatientReviews() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [pendingReviews, setPendingReviews] = useState([]);
  const [submittedReviews, setSubmittedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('pending');

  useEffect(() => {
    (async () => {
      try {
        const appointmentsResponse = await appointmentsAPI.getMyAppointments();
        const appointments = appointmentsResponse.data.appointments || [];

        const reviewsResponse = await reviewsAPI.getMyReviews();
        const reviews = reviewsResponse.data.reviews || [];

        // Appointments that already have a review
        const reviewedIds = reviews.map((r) => r.appointmentId?._id || r.appointmentId);

        // Pending = my COMPLETED appointments without a review
        const pending = appointments.filter((appt) => {
          const isCompleted = (appt.status || '').toUpperCase().trim() === 'COMPLETED';
          const apptPatientId = appt.patientId?._id || appt.patientId;
          const isMine = String(apptPatientId) === String(currentUser._id);
          return isCompleted && isMine && !reviewedIds.includes(appt._id);
        });

        setPendingReviews(pending);
        setSubmittedReviews(reviews);
        // Land on the tab that has something to show
        if (pending.length === 0 && reviews.length > 0) setTab('submitted');
      } catch (err) {
        setError('Failed to load reviews data: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser._id]);

  const tabs = [
    { id: 'pending', label: 'To review', count: pendingReviews.length },
    { id: 'submitted', label: 'My reviews', count: submittedReviews.length },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Feedback"
        title="My reviews"
        subtitle="Rate completed consultations to help other patients choose with confidence."
      />

      {error && <Alert tone="danger" className="mb-6">{error}</Alert>}

      <Tabs tabs={tabs} value={tab} onChange={setTab} className="mb-6" />

      {loading ? (
        <CardListSkeleton rows={2} />
      ) : tab === 'pending' ? (
        pendingReviews.length === 0 ? (
          <EmptyState icon={Star} title="Nothing to review" description="Completed consultations awaiting your feedback will show up here." />
        ) : (
          <div className="space-y-4">
            {pendingReviews.map((appt) => (
              <Card key={appt._id} padding="sm" className="sm:p-5" hoverable>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-4">
                    <DateTile date={appt.slotId?.date} className="h-16 w-16" />
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-lg font-semibold text-fg">Dr. {cleanDoctorName(appt.doctorId?.name)}</h3>
                      <p className="text-sm text-muted">
                        {formatDateShort(appt.slotId?.date)} · {formatTimeRange(appt.slotId?.startTime, appt.slotId?.endTime)}
                      </p>
                    </div>
                  </div>
                  <Button icon={PenLine} onClick={() => navigate(`/appointments/${appt._id}/review`)}>
                    Leave review
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : submittedReviews.length === 0 ? (
        <EmptyState icon={MessageSquareText} title="You haven’t reviewed any doctors yet" />
      ) : (
        <div className="space-y-4">
          {submittedReviews.map((review) => (
            <Card key={review._id} padding="sm" className="sm:p-5">
              <div className="flex items-start gap-4">
                <Avatar name={review.doctorId?.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold text-fg">Dr. {cleanDoctorName(review.doctorId?.name)}</h3>
                    <span className="text-xs text-subtle">{formatDateShort(String(review.createdAt).slice(0, 10))}</span>
                  </div>
                  <Stars value={review.rating} className="mt-1" size="h-[18px] w-[18px]" />
                  {review.comment && <p className="mt-3 text-sm leading-relaxed text-muted">{review.comment}</p>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
