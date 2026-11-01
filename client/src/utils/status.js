// Central status → label/tone mapping so every page badges statuses the same way.

export const APPOINTMENT_STATUS = {
  PENDING_PAYMENT: { label: 'Awaiting payment', tone: 'warning' },
  CONFIRMED: { label: 'Confirmed', tone: 'success' },
  COMPLETED: { label: 'Completed', tone: 'info' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
  RESCHEDULED: { label: 'Rescheduled', tone: 'violet' },
};

export const VERIFICATION_STATUS = {
  PENDING: { label: 'Pending review', tone: 'warning' },
  VERIFIED: { label: 'Verified', tone: 'success' },
  REJECTED: { label: 'Rejected', tone: 'danger' },
  SUSPENDED: { label: 'Suspended', tone: 'warning' },
};

export const REPORT_STATUS = {
  OPEN: { label: 'Open', tone: 'warning' },
  UNDER_REVIEW: { label: 'Under review', tone: 'info' },
  ACTIONED: { label: 'Actioned', tone: 'success' },
  DISMISSED: { label: 'Dismissed', tone: 'neutral' },
};

export const REPORT_REASON = {
  PROFESSIONALISM: { label: 'Professionalism', tone: 'danger' },
  COMMUNICATION: { label: 'Communication', tone: 'warning' },
  APPOINTMENT_ISSUES: { label: 'Appointment issues', tone: 'info' },
  OTHER: { label: 'Other', tone: 'neutral' },
};

export const statusMeta = (map, key) =>
  map[key] || { label: String(key || 'Unknown').replace(/_/g, ' '), tone: 'neutral' };
