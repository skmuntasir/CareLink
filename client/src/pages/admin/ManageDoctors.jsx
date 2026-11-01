import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, UserX, X } from 'lucide-react';
import { adminAPI } from '../../api/api';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import Avatar from '../../components/ui/Avatar';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { CardListSkeleton } from '../../components/ui/Loaders';
import useDebounce from '../../hooks/useDebounce';
import { cleanDoctorName } from '../../utils/doctorUtils';
import { formatMoney } from '../../utils/format';
import { VERIFICATION_STATUS, statusMeta } from '../../utils/status';

const LIMIT = 10;

function StatusBadge({ doctor }) {
  if (doctor.user.deletedAt) return <Badge tone="danger" dot>Deleted</Badge>;
  // A suspended user is shown as suspended regardless of verification state
  if (doctor.user.suspendedAt) return <Badge tone="warning" dot>Suspended</Badge>;
  const meta = statusMeta(VERIFICATION_STATUS, doctor.verificationStatus);
  return <Badge tone={meta.tone} dot>{meta.label}</Badge>;
}

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', active: '', q: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const debouncedQuery = useDebounce(filters.q, 350);
  const hasFilters = Boolean(filters.status || filters.active || filters.q);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const response = await adminAPI.getAllDoctors({
          status: filters.status,
          active: filters.active,
          q: debouncedQuery,
          page,
          limit: LIMIT,
        });
        if (cancelled) return;
        setDoctors(response.data.doctors || []);
        setTotal(response.data.total || 0);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        if (!cancelled) setError(err.message || 'Failed to load doctors');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filters.status, filters.active, debouncedQuery, page]);

  const changeFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1); // back to first page whenever filters change
  };

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Manage doctors"
        subtitle="Search, filter and open any doctor to edit, suspend or review their reports."
        actions={!loading && !error && <Badge tone="brand" size="lg">{total} doctors</Badge>}
      />

      <Card padding="sm" className="mb-6">
        <div className="grid gap-4 md:grid-cols-4 md:items-end">
          <Input
            label="Search"
            icon={Search}
            placeholder="Name, email, license…"
            value={filters.q}
            onChange={(e) => changeFilter('q', e.target.value)}
          />
          <Select label="Verification" value={filters.status} onChange={(e) => changeFilter('status', e.target.value)}>
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </Select>
          <Select label="Account" value={filters.active} onChange={(e) => changeFilter('active', e.target.value)}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </Select>
          <Button
            variant="secondary"
            icon={X}
            disabled={!hasFilters}
            onClick={() => {
              setFilters({ status: '', active: '', q: '' });
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        </div>
      </Card>

      {error && (
        <Alert tone="danger" title="Couldn’t load doctors" className="mb-6">
          {error}
        </Alert>
      )}

      {loading ? (
        <CardListSkeleton rows={4} />
      ) : doctors.length === 0 && !error ? (
        <EmptyState icon={UserX} title="No doctors found" description={hasFilters ? 'Try adjusting or clearing your filters.' : 'Doctors will appear here once they register.'} />
      ) : (
        <>
          <Card padding="none" className="overflow-hidden">
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>Experience</th>
                    <th>Fee</th>
                    <th>License</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={doctor.user.name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-fg">Dr. {cleanDoctorName(doctor.user.name)}</p>
                            <p className="truncate text-xs text-muted">{doctor.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-fg">{doctor.specialization}</td>
                      <td className="tabular-nums text-muted">{doctor.experienceYears} yrs</td>
                      <td className="tabular-nums text-muted">{formatMoney(doctor.fee)}</td>
                      <td className="font-mono text-xs text-muted">{doctor.licenseNo}</td>
                      <td><StatusBadge doctor={doctor} /></td>
                      <td className="text-right">
                        <Button as={Link} to={`/admin/doctors/${doctor.user._id}`} size="sm" variant="soft">
                          Details <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-line/70 md:hidden">
              {doctors.map((doctor) => (
                <li key={doctor._id} className="space-y-3 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={doctor.user.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-fg">Dr. {cleanDoctorName(doctor.user.name)}</p>
                      <p className="truncate text-xs text-muted">{doctor.specialization} · {doctor.experienceYears} yrs</p>
                    </div>
                    <StatusBadge doctor={doctor} />
                  </div>
                  <Button as={Link} to={`/admin/doctors/${doctor.user._id}`} size="sm" variant="secondary" className="w-full">
                    View details
                  </Button>
                </li>
              ))}
            </ul>
          </Card>

          <Pagination page={page} limit={LIMIT} total={total} onChange={setPage} noun="doctors" />
        </>
      )}
    </div>
  );
}
