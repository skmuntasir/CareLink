import {
  LayoutDashboard,
  Stethoscope,
  CalendarDays,
  Pill,
  HeartPulse,
  Star,
  UserCog,
  CalendarClock,
  ShieldCheck,
  Users,
  Flag,
  IdCard,
} from 'lucide-react';

// Sidebar navigation per role. `match` lists path prefixes that mark an item
// active (so detail pages keep their parent section highlighted).
export const NAV_BY_ROLE = {
  PATIENT: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/doctors', label: 'Find Doctors', icon: Stethoscope, match: ['/doctors'] },
    { to: '/appointments', label: 'Appointments', icon: CalendarDays, match: ['/appointments'] },
    { to: '/patient/prescriptions', label: 'Prescriptions', icon: Pill, match: ['/patient/prescriptions'] },
    { to: '/health-records', label: 'Health Records', icon: HeartPulse, match: ['/health-records'] },
    { to: '/patient/reviews', label: 'My Reviews', icon: Star, match: ['/patient/reviews'] },
  ],
  DOCTOR: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/doctor/appointments', label: 'Appointments', icon: CalendarDays, match: ['/doctor/appointments', '/appointments', '/doctor/patients'] },
    { to: '/doctor/slots', label: 'Availability', icon: CalendarClock, match: ['/doctor/slots'] },
    { to: '/doctor/prescriptions', label: 'Prescriptions', icon: Pill, match: ['/doctor/prescriptions'] },
    { to: '/doctor/profile', label: 'My Profile', icon: UserCog, match: ['/doctor/profile'] },
  ],
  ADMIN: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/admin/verify-doctors', label: 'Verify Doctors', icon: ShieldCheck, match: ['/admin/verify-doctors'] },
    { to: '/admin/manage-doctors', label: 'Manage Doctors', icon: Users, match: ['/admin/manage-doctors', '/admin/doctors'] },
    { to: '/admin/reports', label: 'Reports', icon: Flag, match: ['/admin/reports'] },
    { to: '/admin/profile', label: 'Profile & Audit', icon: IdCard, match: ['/admin/profile'] },
  ],
};

export const ROLE_LABEL = {
  PATIENT: 'Patient',
  DOCTOR: 'Doctor',
  ADMIN: 'Administrator',
};

export const isNavActive = (item, pathname) => {
  if (item.exact) return pathname === item.to;
  return (item.match || [item.to]).some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};
