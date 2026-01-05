import { Navigate } from 'react-router-dom';

// Helper function to get the correct dashboard URL based on user role
function getDashboardUrl(userRole) {
  const roleToUrl = {
    'ADMIN': '/admin/dashboard',
    'STUDENT': '/student/dashboard',
    'WARDEN': '/warden/dashboard',
    'STAFF': '/staff/dashboard',
    'UNIVERSITY': '/university/dashboard'
  };
  return roleToUrl[userRole] || '/individual-login';
}

export function ProtectedRoute({ children, requireAuth = true, allowedRoles = [] }) {
  const token = localStorage.getItem('auth_token');
  const authRole = localStorage.getItem('auth_role');
  const userStr = localStorage.getItem('auth_user');

  // Check if authentication is required
  if (requireAuth && !token) {
    return <Navigate to="/individual-login" replace />;
  }

  // Check if specific roles are allowed
  if (allowedRoles.length > 0) {
    let userRole = authRole;
    
    // If it's an individual user, get their specific role from user data
    if (authRole === 'INDIVIDUAL' && userStr) {
      try {
        const user = JSON.parse(userStr);
        userRole = user.userType;
      } catch (e) {
        console.error('Failed to parse user:', e);
        return <Navigate to="/individual-login" replace />;
      }
    }

    if (!allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on specific role
      const correctDashboard = getDashboardUrl(userRole);
      return <Navigate to={correctDashboard} replace />;
    }
  }

  return children;
}

export function UniversityProtectedRoute({ children }) {
  const token = localStorage.getItem('auth_token');
  const authRole = localStorage.getItem('auth_role');
  const userStr = localStorage.getItem('auth_user');

  if (!token) {
    return <Navigate to="/university-login" replace />;
  }

  if (authRole !== 'UNIVERSITY') {
    // If not university, redirect to their correct dashboard
    if (authRole === 'INDIVIDUAL' && userStr) {
      try {
        const user = JSON.parse(userStr);
        const correctDashboard = getDashboardUrl(user.userType);
        return <Navigate to={correctDashboard} replace />;
      } catch {
        return <Navigate to="/individual-login" replace />;
      }
    }
    return <Navigate to="/individual-login" replace />;
  }

  return children;
}
