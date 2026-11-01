import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { appointmentsAPI, reviewsAPI } from '../../api/api';
import { useUI } from '../../context/UIContext';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Avatar from '../../components/ui/Avatar';
import Textarea from '../../components/ui/Textarea';
import { StarRatingInput } from '../../components/ui/Stars';
import { PageLoader } from '../../components/ui/Loaders';
import { cleanDoctorName } from '../../utils/doctorUtils';
import { formatDate, formatTime } from '../../utils/format';

const MAX_COMMENT = 500;

export default function LeaveReview() {
  const { id: appointmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useUI();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const response = await appointmentsAPI.getAppointmentById(appointmentId);
        setAppointment(response.data.appointment);
      } catch (err) {
        setLoadError('Failed to load appointment: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [appointmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      setSubmitting(true);
      await reviewsAPI.createReview({ appointmentId, rating, comment });
      toast.success('Thanks! Your review was submitted.');
      navigate('/patient/reviews');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader label="Loading appointment details…" />;

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Leave a review" back="/patient/reviews" backLabel="Back to reviews" />
        <Alert tone="danger">{loadError}</Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Leave a review"
        subtitle="Your honest feedback helps other patients and helps doctors improve."
        back="/patient/reviews"
        backLabel="Back to reviews"
      />

      <Card padding="lg">
        {appointment && (
          <div className="mb-8 flex items-center gap-4 rounded-2xl border border-line bg-surface-2/50 p-4">
            <Avatar name={appointment.doctorId?.name} size="lg" />
            <div>
              <p className="font-display text-lg font-semibold text-fg">Dr. {cleanDoctorName(appointment.doctorId?.name)}</p>
              <p className="text-sm text-muted">
                {formatDate(appointment.slotId?.date)} at {formatTime(appointment.slotId?.startTime)}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && <Alert tone="danger">{submitError}</Alert>}

          <div>
            <p className="mb-2 text-sm font-medium text-fg">How was your consultation?</p>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>

          <div>
            <Textarea
              label="Comment (optional)"
              rows={5}
              maxLength={MAX_COMMENT}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience…"
            />
            <p className="mt-1 text-right text-xs text-subtle">
              {comment.length}/{MAX_COMMENT}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => navigate('/patient/reviews')}>
              Cancel
            </Button>
            <Button type="submit" icon={Send} loading={submitting} disabled={rating === 0}>
              Submit review
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
