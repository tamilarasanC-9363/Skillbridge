import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login but save the current location they tried to access
    return <Navigate to="/login" state={{ from: location, message: 'You are not authorized to view this page. Please login.' }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect authorized users to their respective dashboard home if they try to visit unauthorized sections
    if (userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (userRole === 'worker') {
      return <Navigate to="/worker" replace />;
    } else {
      return <Navigate to="/customer" replace />;
    }
  }

  return children;
}
