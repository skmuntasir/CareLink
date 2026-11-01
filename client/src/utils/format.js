// Presentation helpers shared across pages.
// Slot dates are stored as 'YYYY-MM-DD' strings and times as 'HH:mm'.

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  // 'YYYY-MM-DD' parsed as local time (avoids the UTC off-by-one-day bug)
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const formatDate = (dateStr, opts) => {
  const d = parseLocalDate(dateStr);
  if (!d) return dateStr || '—';
  return d.toLocaleDateString('en-GB', opts || { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateShort = (dateStr) =>
  formatDate(dateStr, { day: 'numeric', month: 'short', year: 'numeric' });

export const dateParts = (dateStr) => {
  const d = parseLocalDate(dateStr);
  if (!d) return { day: '--', month: '---', weekday: '' };
  return {
    day: String(d.getDate()),
    month: d.toLocaleDateString('en-GB', { month: 'short' }),
    weekday: d.toLocaleDateString('en-GB', { weekday: 'short' }),
  };
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const m = /^(\d{1,2}):(\d{2})/.exec(timeStr);
  if (!m) return timeStr;
  const h = Number(m[1]);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m[2]} ${suffix}`;
};

export const formatTimeRange = (start, end) =>
  start && end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start);

export const formatMoney = (amount) =>
  `BDT ${Number(amount || 0).toLocaleString('en-US')}`;

export const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const timeAgo = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 0 || seconds < 45) return 'Just now';
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  const days = Math.floor(seconds / 86400);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export const initials = (name = '') => {
  const parts = String(name).replace(/^dr\.?\s*/i, '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export const firstName = (name = '') =>
  String(name).replace(/^dr\.?\s*/i, '').trim().split(/\s+/)[0] || '';

export const bmi = (weightKg, heightCm) => {
  const w = Number(weightKg);
  const h = Number(heightCm);
  if (!w || !h) return null;
  const value = w / ((h / 100) ** 2);
  return Number.isFinite(value) ? Math.round(value * 10) / 10 : null;
};
