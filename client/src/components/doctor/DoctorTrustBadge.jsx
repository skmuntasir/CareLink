import { BadgeCheck, Clock, Stethoscope, Star } from 'lucide-react';
import Badge from '../ui/Badge';

/**
 * Compact trust summary for a doctor: rating, specialty, experience and
 * verification state.
 */
const DoctorTrustBadge = ({
  rating = 0,
  totalReviews = 0,
  specialization = '',
  experienceYears = 0,
  isVerified = false,
  className = '',
}) => {
  const roundedRating = Math.round(Number(rating || 0) * 10) / 10;

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${className}`}>
      <span className="inline-flex items-center gap-1.5 text-sm">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
        <span className="font-semibold tabular-nums text-fg">{roundedRating.toFixed(1)}</span>
        <span className="text-muted">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
      </span>

      {specialization && (
        <Badge tone="brand" icon={Stethoscope}>
          {specialization}
        </Badge>
      )}

      {experienceYears > 0 && (
        <Badge tone="info" icon={Clock}>
          {experienceYears}+ yrs experience
        </Badge>
      )}

      {isVerified && (
        <Badge tone="success" icon={BadgeCheck}>
          Verified
        </Badge>
      )}
    </div>
  );
};

export default DoctorTrustBadge;
