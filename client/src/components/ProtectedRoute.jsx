import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './ui/Loaders';

/**
 * Guards a route (or a group of nested routes) behind authentication and,
 * optionally, a list of allowed roles. Works both wrapping children and as a
 * layout route that renders <Outlet />.
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader className="min-h-screen" label="Loading your workspace…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ?? <Outlet />;
}
