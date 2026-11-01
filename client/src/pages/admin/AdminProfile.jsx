import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, KeyRound, Lock, Mail, Phone, Save, User } from 'lucide-react';
import { adminAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import Avatar from '../../components/ui/Avatar';
import Pagination from '../../components/ui/Pagination';
import { PageLoader, Skeleton } from '../../components/ui/Loaders';
import { formatDateTime } from '../../utils/format';

const LOG_LIMIT = 8;

export default function AdminProfile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useUI();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', email: '', role: '' });
  const [updating, setUpdating] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [auditLogs, setAuditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const [actionType, setActionType] = useState('');

  const loadAdminProfile = useCallback(async () => {
    try {
      const response = await adminAPI.getMe();
      const a = response.data.admin;
      setAdmin(a);
      setProfileForm({ name: a.name || '', phone: a.phone ?? '', email: a.email || '', role: a.role || '' });
    } catch (error) {
      console.error('Error loading admin profile:', error);
      toast.error('Could not load your profile.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAdminProfile();
  }, [loadAdminProfile]);

  // Audit logs reload on their own — paging/filtering shouldn't refetch the profile
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLogsLoading(true);
        const response = await adminAPI.getAuditLogs({ limit: LOG_LIMIT, page: logsPage, actionType });
        if (cancelled) return;
        setAuditLogs(response.data.logs || []);
        setLogsTotal(response.data.total || 0);
      } catch (error) {
        console.error('Error loading audit logs:', error);
      } finally {
        if (!cancelled) setLogsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [logsPage, actionType]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');
    try {
      setUpdating(true);
      await adminAPI.updateMe({
        name: profileForm.name,
        phone: profileForm.phone || null,
        email: profileForm.email,
        role: profileForm.role,
      });
      toast.success('Profile updated successfully!');
      loadAdminProfile();
    } catch (error) {
      setProfileError(error.message || 'Error updating profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setChangingPassword(true);
      await adminAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed. You will be logged out and redirected to login.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (error) {
      setPasswordError(error.message || 'Error changing password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <PageLoader label="Loading admin profile…" />;

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Profile & audit log"
        subtitle="Manage your account details, password and review administrative activity."
      />

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <div className="mb-6 flex items-center gap-4">
              <Avatar name={admin?.name} size="lg" />
              <div className="min-w-0">
                <h2 className="truncate font-display text-xl font-semibold text-fg">{admin?.name}</h2>
                <Badge tone="brand" className="mt-1">{admin?.role}</Badge>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {profileError && <Alert tone="danger">{profileError}</Alert>}
              <Input label="Name" icon={User} required value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
              <Input label="Email" icon={Mail} type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
              <Select
                label="Role"
                value={profileForm.role}
                onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                hint="Changing your own role affects your access after the next sign-in."
              >
                <option value="ADMIN">Admin</option>
                <option value="DOCTOR">Doctor</option>
                <option value="PATIENT">Patient</option>
              </Select>
              <Input label="Phone (optional)" icon={Phone} type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
              <Button type="submit" className="w-full" icon={Save} loading={updating}>
                {updating ? 'Updating…' : 'Update profile'}
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader icon={KeyRound} title="Change password" subtitle="You will be signed out afterwards" />
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && <Alert tone="danger">{passwordError}</Alert>}
              <Input label="Current password" icon={Lock} type="password" autoComplete="current-password" required value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
              <Input label="New password" icon={Lock} type="password" autoComplete="new-password" required value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              <Input label="Confirm new password" icon={Lock} type="password" autoComplete="new-password" required value={passwordForm.confirmNewPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })} />
              <Button type="submit" variant="secondary" className="w-full" loading={changingPassword}>
                {changingPassword ? 'Changing…' : 'Change password'}
              </Button>
            </form>
          </Card>
        </div>

        <Card className="xl:col-span-3">
          <CardHeader
            icon={History}
            title="Audit log"
            subtitle="Administrative actions on doctors"
            action={
              <Select
                aria-label="Filter by action"
                className="!py-1.5 text-xs"
                value={actionType}
                onChange={(e) => {
                  setActionType(e.target.value);
                  setLogsPage(1);
                }}
              >
                <option value="">All actions</option>
                <option value="VERIFY_DOCTOR">Verify doctor</option>
                <option value="REJECT_DOCTOR">Reject doctor</option>
                <option value="SUSPEND_DOCTOR">Suspend doctor</option>
                <option value="UNSUSPEND_DOCTOR">Unsuspend doctor</option>
                <option value="EDIT_DOCTOR">Edit doctor</option>
                <option value="SOFT_DELETE_DOCTOR">Delete doctor</option>
              </Select>
            }
          />

          {logsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 !rounded-xl" />
              ))}
            </div>
          ) : auditLogs.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">No audit logs found.</p>
          ) : (
            <ul className="space-y-3">
              {auditLogs.map((log) => {
                const changed = Object.keys(log.metadata?.changedFields || {});
                return (
                  <li key={log._id} className="rounded-xl border border-line/80 bg-surface-2/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge tone="brand">{log.actionType.replace(/_/g, ' ')}</Badge>
                      <span className="text-xs text-subtle">{formatDateTime(log.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted">{log.note || 'No additional details'}</p>
                    {changed.length > 0 && (
                      <p className="mt-1.5 text-xs text-subtle">
                        <span className="font-medium text-muted">Changed:</span> {changed.join(', ')}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <Pagination page={logsPage} limit={LOG_LIMIT} total={logsTotal} onChange={setLogsPage} noun="logs" />
        </Card>
      </div>
    </div>
  );
}
