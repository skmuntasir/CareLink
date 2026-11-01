import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CalendarPlus, Search, SearchX, Stethoscope, X } from 'lucide-react';
import { doctorAPI } from '../api/api';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import EmptyState from '../components/ui/EmptyState';
import { GridSkeleton } from '../components/ui/Loaders';
import DoctorTrustBadge from '../components/doctor/DoctorTrustBadge';
import BookingModal from '../components/doctor/BookingModal';
import { useAuth } from '../context/AuthContext';
import useDebounce from '../hooks/useDebounce';
import { cleanDoctorName } from '../utils/doctorUtils';
import { formatMoney, todayStr } from '../utils/format';

export function DoctorsList() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({ specialization: '', availableOn: '' });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Wait for the user to stop typing before querying
  const debouncedSpecialization = useDebounce(filters.specialization, 350);
  const canBook = user?.role === 'PATIENT';
  const hasFilters = Boolean(filters.specialization || filters.availableOn);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const response = await doctorAPI.getVerifiedDoctors({
          specialization: debouncedSpecialization,
          availableOn: filters.availableOn,
        });
        if (!cancelled) setDoctors(response.data.doctors || []);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        if (!cancelled) {
          setDoctors([]);
          setError(err.message || 'Failed to load doctors');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedSpecialization, filters.availableOn]);

  return (
    <div>
      <PageHeader
        eyebrow="Doctors"
        title="Find a doctor"
        subtitle="Browse verified specialists, check their availability and book in a few clicks."
      />

      <Card padding="sm" className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            wrapperClassName="flex-1"
            label="Specialization"
            icon={Search}
            type="text"
            placeholder="e.g. Cardiology, Dermatology…"
            value={filters.specialization}
            onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
          />
          <Input
            wrapperClassName="sm:w-56"
            label="Available on"
            icon={CalendarDays}
            type="date"
            min={todayStr()}
            value={filters.availableOn}
            onChange={(e) => setFilters({ ...filters, availableOn: e.target.value })}
          />
          {hasFilters && (
            <Button variant="ghost" icon={X} onClick={() => setFilters({ specialization: '', availableOn: '' })}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {!loading && !error && (
        <p className="mb-4 text-sm text-muted">
          <span className="font-semibold text-fg">{doctors.length}</span> {doctors.length === 1 ? 'doctor' : 'doctors'} found
        </p>
      )}

      {loading ? (
        <GridSkeleton />
      ) : error ? (
        <EmptyState icon={SearchX} title="Couldn’t load doctors" description={error} />
      ) : doctors.length === 0 ? (
        <EmptyState
          icon={hasFilters ? SearchX : Stethoscope}
          title={hasFilters ? 'No doctors match your filters' : 'No verified doctors available yet'}
          description={hasFilters ? 'Try a different specialization or date.' : 'Ask an admin to verify doctors to get started.'}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => (
            <Card key={doctor._id} hoverable className="flex flex-col">
              <div className="flex items-start gap-4">
                <Avatar name={doctor.userId.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/doctors/${doctor.userId._id}`}
                    className="block truncate font-display text-lg font-semibold text-fg transition-colors hover:text-brand-text"
                  >
                    Dr. {cleanDoctorName(doctor.userId.name)}
                  </Link>
                  <p className="truncate text-sm text-muted">{doctor.specialization}</p>
                </div>
              </div>

              <DoctorTrustBadge
                className="mt-4"
                rating={doctor.avgRating || 0}
                totalReviews={doctor.totalReviews || 0}
                experienceYears={doctor.experienceYears}
                isVerified={doctor.verificationStatus === 'VERIFIED'}
              />

              <div className="mt-4 flex-1">
                <p className="line-clamp-2 text-sm leading-relaxed text-muted">{doctor.bio}</p>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-subtle">Consultation</p>
                  <p className="font-display text-lg font-semibold text-fg">{formatMoney(doctor.fee)}</p>
                </div>
                <div className="flex gap-2">
                  <Button as={Link} to={`/doctors/${doctor.userId._id}`} variant="secondary" size="sm">
                    Profile
                  </Button>
                  {canBook && (
                    <Button size="sm" icon={CalendarPlus} onClick={() => setSelectedDoctor(doctor)}>
                      Book
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedDoctor && (
        <BookingModal doctor={selectedDoctor} date={filters.availableOn} onClose={() => setSelectedDoctor(null)} />
      )}
    </div>
  );
}

export default DoctorsList;
