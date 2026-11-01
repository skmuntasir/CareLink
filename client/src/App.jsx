import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { UIProvider } from './context/UIContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/system/ErrorBoundary';
import AppShell from './components/layout/AppShell';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import DoctorsList from './pages/DoctorsList';
import ConsultationChat from './pages/ConsultationChat';

import DoctorProfile from './pages/doctor/DoctorProfile';
import ManageSlots from './pages/doctor/ManageSlots';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import CreatePrescription from './pages/doctor/CreatePrescription';
import DoctorPatientHealthRecords from './pages/doctor/DoctorPatientHealthRecords';

import VerifyDoctors from './pages/admin/VerifyDoctors';
import AdminProfile from './pages/admin/AdminProfile';
import ManageDoctors from './pages/admin/ManageDoctors';
import DoctorDetail from './pages/admin/DoctorDetail';
import ManageReports from './pages/admin/ManageReports';

import PatientAppointments from './pages/patient/PatientAppointments';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PatientReviews from './pages/patient/PatientReviews';
import HealthRecords from './pages/patient/HealthRecords';
import LeaveReview from './pages/patient/LeaveReview';
import ViewDoctorProfile from './pages/patient/ViewDoctorProfile';

function App() {
  return (
    <ErrorBoundary>
      <UIProvider>
        <AuthProvider
          onLogout={() => {
            // Clear notifications when user logs out
            window.dispatchEvent(new CustomEvent('clearNotifications'));
          }}
        >
          <NotificationProvider>
            <Router>
              <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Authenticated area — sidebar/topbar shell */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppShell />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/doctors" element={<DoctorsList />} />
                    <Route path="/appointments/:id/chat" element={<ConsultationChat />} />

                    {/* Doctor */}
                    <Route element={<ProtectedRoute roles={['DOCTOR']} />}>
                      <Route path="/doctor/profile" element={<DoctorProfile />} />
                      <Route path="/doctor/slots" element={<ManageSlots />} />
                      <Route path="/doctor/appointments" element={<DoctorAppointments />} />
                      <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
                      <Route path="/doctor/prescriptions/create/:appointmentId" element={<CreatePrescription />} />
                      <Route path="/doctor/patients/:patientId/health-records" element={<DoctorPatientHealthRecords />} />
                    </Route>

                    {/* Admin */}
                    <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                      <Route path="/admin/verify-doctors" element={<VerifyDoctors />} />
                      <Route path="/admin/profile" element={<AdminProfile />} />
                      <Route path="/admin/manage-doctors" element={<ManageDoctors />} />
                      <Route path="/admin/doctors/:doctorUserId" element={<DoctorDetail />} />
                      <Route path="/admin/reports" element={<ManageReports />} />
                    </Route>

                    {/* Patient */}
                    <Route element={<ProtectedRoute roles={['PATIENT']} />}>
                      <Route path="/appointments" element={<PatientAppointments />} />
                      <Route path="/appointments/:id/review" element={<LeaveReview />} />
                      <Route path="/patient/reviews" element={<PatientReviews />} />
                      <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
                      <Route path="/health-records" element={<HealthRecords />} />
                      <Route path="/doctors/:id" element={<ViewDoctorProfile />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Route>

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </UIProvider>
    </ErrorBoundary>
  );
}

export default App;
