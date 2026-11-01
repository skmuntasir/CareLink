import {
  Bell,
  BellRing,
  CalendarDays,
  CheckCheck,
  CreditCard,
  MessageSquare,
  Pill,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../ui/Loaders';
import { cn } from '../../utils/cn';
import { timeAgo } from '../../utils/format';

// type → icon + tint
const resolveMeta = (type = '', metadata = {}) => {
  const key = String(type).toUpperCase();

  if (key === 'VERIFICATION') {
    const bad = ['SUSPENDED', 'REJECTED', 'UNSUSPENDED'].includes(metadata.action);
    return bad
      ? { icon: ShieldAlert, tint: 'bg-amber-500/10 text-amber-600 dark:text-amber-300', label: 'Verification' }
      : { icon: ShieldCheck, tint: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300', label: 'Verification' };
  }

  switch (key) {
    case 'APPOINTMENT':
      return { icon: CalendarDays, tint: 'bg-sky-500/10 text-sky-600 dark:text-sky-300', label: 'Appointment' };
    case 'PAYMENT':
      return { icon: CreditCard, tint: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300', label: 'Payment' };
    case 'PRESCRIPTION':
      return { icon: Pill, tint: 'bg-violet-500/10 text-violet-600 dark:text-violet-300', label: 'Prescription' };
    case 'CHAT':
      return { icon: MessageSquare, tint: 'bg-brand-500/10 text-brand-text', label: 'Chat' };
    default:
      return { icon: BellRing, tint: 'bg-fg/[0.06] text-muted', label: 'System' };
  }
};

// Only follow in-app links to sections that exist
const KNOWN_ROUTES = [
  '/appointments',
  '/payments',
  '/prescriptions',
  '/doctors',
  '/profile',
  '/dashboard',
  '/doctor/',
  '/admin/',
  '/patient/',
  '/health-records',
];

const EMPTY_COPY = {
  ADMIN: 'No verification requests right now.',
  PATIENT: 'No updates yet.',
  DOCTOR: 'No new appointment updates yet.',
};

const NotificationPanel = ({ notifications, loading, isOpen, onClose, onMarkAllAsRead, onNotificationClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = (notification) => {
    try {
      onNotificationClick?.(notification);

      const link = notification.link;
      if (typeof link === 'string' && link.startsWith('/') && KNOWN_ROUTES.some((r) => link.startsWith(r))) {
        navigate(link);
      }
      onClose?.();
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  if (!isOpen) return null;

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className="fixed inset-x-3 top-[4.25rem] z-50 animate-pop-in overflow-hidden rounded-2xl border border-line bg-surface shadow-lift sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[24rem]"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h3 className="font-display text-base font-semibold text-fg">Notifications</h3>
        {hasUnread && (
          <button
            onClick={onMarkAllAsRead}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-brand-text transition-colors hover:bg-brand-500/10"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[26rem] overflow-y-auto">
        {loading ? (
          <ul>
            {[...Array(4)].map((_, i) => (
              <li key={i} className="flex gap-3 border-b border-line/70 p-4">
                <Skeleton className="h-9 w-9 !rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </li>
            ))}
          </ul>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-fg/[0.05] text-subtle">
              <Bell className="h-6 w-6" />
            </span>
            <p className="text-sm font-medium text-fg">You&apos;re all caught up</p>
            <p className="mt-1 text-sm text-muted">{EMPTY_COPY[user?.role] || 'No notifications yet.'}</p>
          </div>
        ) : (
          <ul>
            {notifications.map((n) => {
              const meta = resolveMeta(n.type, n.metadata || {});
              const Icon = meta.icon;
              return (
                <li key={n._id || n.id}>
                  <button
                    type="button"
                    onClick={() => handleClick(n)}
                    className={cn(
                      'flex w-full items-start gap-3 border-b border-line/70 px-4 py-3.5 text-left transition-colors hover:bg-fg/[0.04]',
                      !n.read && 'bg-brand-500/[0.05]'
                    )}
                  >
                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', meta.tint)}>
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn('block text-sm leading-snug', n.read ? 'text-muted' : 'font-medium text-fg')}>
                        {n.message || 'No message'}
                      </span>
                      <span className="mt-1 flex items-center gap-2 text-xs text-subtle">
                        <span>{meta.label}</span>
                        <span aria-hidden="true">·</span>
                        <span>{timeAgo(n.createdAt || n.timestamp) || 'Unknown time'}</span>
                      </span>
                    </span>
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" aria-label="Unread" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
