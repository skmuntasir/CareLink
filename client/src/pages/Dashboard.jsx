import { useAuth } from '../context/AuthContext';
import PatientDashboard from './dashboard/PatientDashboard';
import DoctorDashboard from './dashboard/DoctorDashboard';
import AdminDashboard from './dashboard/AdminDashboard';

// Role-aware landing page shown right after login.
export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'ADMIN') return <AdminDashboard />;
  if (user?.role === 'DOCTOR') return <DoctorDashboard />;
  return <PatientDashboard />;
}
