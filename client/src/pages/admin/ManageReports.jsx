import { useEffect, useState } from 'react';
import { Flag, X } from 'lucide-react';
import { adminReportsAPI } from '../../api/api';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import Avatar from '../../components/ui/Avatar';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { CardListSkeleton } from '../../components/ui/Loaders';
import ReportManageModal from '../../components/admin/ReportManageModal';
import { formatDateShort } from '../../utils/format';
import { REPORT_REASON, REPORT_STATUS, statusMeta } from '../../utils/status';

const LIMIT = 10;

export default function ManageReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', reason: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const hasFilters = Boolean(filters.status || filters.reason);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const response = await adminReportsAPI.getReports({ ...filters, page, limit: LIMIT });
        if (cancelled) return;
        setReports(response.data.reports || []);
        setTotal(response.data.pagination?.total ?? 0);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load reports');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filters, page, reloadKey]);

  const changeFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Moderation"
        title="Reports"
        subtitle="Review patient reports about doctors and record the outcome."
        actions={!loading && !error && <Badge tone="brand" size="lg">{total} reports</Badge>}
      />

      <Card padding="sm" className="mb-6">
        <div className="grid gap-4 md:grid-cols-3 md:items-end">
          <Select label="Status" value={filters.status} onChange={(e) => changeFilter('status', e.target.value)}>
            <option value="">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="UNDER_REVIEW">Under review</option>
            <option value="ACTIONED">Actioned</option>
            <option value="DISMISSED">Dismissed</option>
          </Select>
          <Select label="Reason" value={filters.reason} onChange={(e) => changeFilter('reason', e.target.value)}>
            <option value="">All reasons</option>
            <option value="PROFESSIONALISM">Professionalism</option>
            <option value="COMMUNICATION">Communication</option>
            <option value="APPOINTMENT_ISSUES">Appointment issues</option>
            <option value="OTHER">Other</option>
          </Select>
          <Button
            variant="secondary"
            icon={X}
            disabled={!hasFilters}
            onClick={() => {
              setFilters({ status: '', reason: '' });
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        </div>
      </Card>

      {error && (
        <Alert
          tone="danger"
          title="Couldn’t load reports"
          className="mb-6"
          action={<Button size="sm" variant="secondary" onClick={() => setReloadKey((k) => k + 1)}>Retry</Button>}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <CardListSkeleton rows={4} />
      ) : reports.length === 0 && !error ? (
        <EmptyState icon={Flag} title="No reports found" description={hasFilters ? 'Try adjusting or clearing your filters.' : 'Nothing has been reported yet.'} />
      ) : (
        <>
          <Card padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Reported by</th>
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
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar name={report.doctorId?.name} size="sm" />
                            <span className="whitespace-nowrap font-medium text-fg">{report.doctorId?.name}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap text-muted">{report.patientId?.name}</td>
                        <td><Badge tone={reason.tone}>{reason.label}</Badge></td>
                        <td><Badge tone={status.tone} dot>{status.label}</Badge></td>
                        <td className="whitespace-nowrap text-muted">{formatDateShort(String(report.createdAt).slice(0, 10))}</td>
                        <td className="text-right">
                          <Button size="sm" variant="soft" onClick={() => setSelectedReport(report)}>
                            View / edit
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          <Pagination page={page} limit={LIMIT} total={total} onChange={setPage} noun="reports" />
        </>
      )}

      {selectedReport && (
        <ReportManageModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onSaved={() => setReloadKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
