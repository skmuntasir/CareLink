import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import { useNotifications } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';

export default function NotificationBell() {
  const { notifications, loading, markAllAsRead, fetchNotifications, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const lastFetchTimeRef = useRef(0);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close panel when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) setIsOpen(false);
    };
    const handleKey = (event) => event.key === 'Escape' && setIsOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    const notificationId = notification._id || notification.id;
    if (notificationId) {
      try {
        await markAsRead(notificationId);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  // Refresh when the dropdown opens (throttled to once per 10 seconds)
  useEffect(() => {
    if (isOpen) {
      const now = Date.now();
      if (now - lastFetchTimeRef.current > 10000) {
        fetchNotifications();
        lastFetchTimeRef.current = now;
      }
    }
  }, [isOpen, fetchNotifications]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-fg/[0.06] hover:text-fg',
          isOpen && 'bg-fg/[0.06] text-fg'
        )}
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        type="button"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-ink-950 ring-2 ring-canvas">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel
        notifications={notifications}
        loading={loading}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onMarkAllAsRead={markAllAsRead}
        onNotificationClick={handleNotificationClick}
      />
    </div>
  );
}
