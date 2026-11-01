import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, CheckCircle2, Flag, History, ShieldCheck, Users, UserRound } from 'lucide-react';
import { adminAPI, adminReportsAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import { CardListSkeleton } from '../../components/ui/Loaders';
import { cleanDoctorName } from '../../utils/doctorUtils';
import { firstName, greeting, timeAgo } from '../../utils/format';
import { REPORT_REASON, statusMeta } from '../../utils/status';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [reports, setReports] = useState({ items: [], total: 0 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [s, p, r, l] = await Promise.allSettled([
        adminAPI.getStats(),
        adminAPI.getPendingDoctors(),
        adminReportsAPI.getReports({ status: 'OPEN', page: 1, limit: 4 }),
        adminAPI.getAuditLogs({ page: 1, limit: 5 }),
      ]);
      if (cancelled) return;
      setStats(s.status === 'fulfilled' ? s.value.data : null);
      setPending(p.status === 'fulfilled' ? p.value.data.doctors || [] : []);
      setReports(
        r.status === 'fulfilled'
          ? { items: r.value.data.reports || [], total: r.value.data.pagination?.total ?? (r.value.data.reports || []).length }
          : { items: [], total: 0 }
      );
      setLogs(l.status === 'fulfilled' ? l.value.data.logs || [] : []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Admin dashboard"
        title={user?.isDemo ? greeting() : `${greeting()}, ${firstName(user?.name)}`}
        subtitle="Platform health, verification queue and moderation at a glance."
        actions={
          <Button as={Link} to="/admin/verify-doctors" icon={ShieldCheck}>
            Review verifications
          </Button>
        }
      />

      {user?.isDemo && (
        <Alert tone="info" title="Demo account" className="mb-6">
          You are exploring CareLink in demo mode. You can manage the demo doctor and demo patient only. Profile and
          password changes are disabled, and nothing you do affects real users.
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={ShieldCheck} tone="warning" label="Pending verifications" value={stats?.pendingVerifications ?? 0} loading={loading} to="/admin/verify-doctors" />
        <StatCard icon={Users} label="Total doctors" value={stats?.totalDoctors ?? 0} loading={loading} to="/admin/manage-doctors" />
        <StatCard icon={UserRound} tone="violet" label="Total patients" value={stats?.totalPatients ?? 0} loading={loading} />
        <StatCard icon={CalendarCheck} tone="info" label="Total appointments" value={stats?.totalAppointments ?? 0} loading={loading} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            icon={ShieldCheck}
            title="Verification queue"
            subtitle={loading ? 'Loading…' : `${pending.length} doctor${pending.length === 1 ? '' : 's'} waiting`}
            action={
              <Link to="/admin/verify-doctors" className="text-sm font-medium text-brand-text hover:underline">
                Open queue
              </Link>
            }
          />
          {loading ? (
            <CardListSkeleton rows={3} />
          ) : pending.length === 0 ? (
            <EmptyState compact icon={CheckCircle2} title="All caught up" description="There are no doctors waiting for verification." />
          ) : (
            <ul className="space-y-3">
              {pending.slice(0, 4).map((doc) => (
                <li key={doc._id} className="flex items-center gap-3 rounded-2xl border border-line/80 bg-surface-2/40 p-3.5">
                  <Avatar name={doc.userId?.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-fg">Dr. {cleanDoctorName(doc.userId?.name)}</p>
                    <p className="truncate text-sm text-muted">{doc.specialization} · {doc.experienceYears} yrs</p>
                  </div>
                  {doc.reverificationRequestedAt && <Badge tone="warning">Re-verify</Badge>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            icon={Flag}
            title="Open reports"
            subtitle={loading ? 'Loading…' : `${reports.total} awaiting review`}
            action={
              <Link to="/admin/reports" className="text-sm font-medium text-brand-text hover:underline">
                All reports
              </Link>
            }
          />
          {loading ? (
            <CardListSkeleton rows={3} />
          ) : reports.items.length === 0 ? (
            <EmptyState compact icon={CheckCircle2} title="No open reports" description="Nothing needs your attention right now." />
          ) : (
            <ul className="space-y-3">
              {reports.items.map((rep) => {
                const reason = statusMeta(REPORT_REASON, rep.reason);
                return (
                  <li key={rep._id} className="flex items-center gap-3 rounded-2xl border border-line/80 bg-surface-2/40 p-3.5">
                    <Avatar name={rep.doctorId?.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-fg">{rep.doctorId?.name}</p>
                      <p className="truncate text-sm text-muted">Reported by {rep.patientId?.name} · {timeAgo(rep.createdAt)}</p>
                    </div>
                    <Badge tone={reason.tone}>{reason.label}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          icon={History}
          title="Recent admin activity"
          subtitle="Latest entries from the audit log"
          action={
            <Link to="/admin/profile" className="text-sm font-medium text-brand-text hover:underline">
              Full audit log
            </Link>
          }
        />
        {loading ? (
          <CardListSkeleton rows={2} />
        ) : logs.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No activity recorded yet.</p>
        ) : (
          <ul className="divide-y divide-line/70">
            {logs.map((log) => (
              <li key={log._id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fg">{String(log.actionType || '').replace(/_/g, ' ')}</p>
                  <p className="truncate text-sm text-muted">{log.note || 'No additional details'}</p>
                </div>
                <span className="shrink-0 text-xs text-subtle">{timeAgo(log.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
