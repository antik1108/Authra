import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Legacy Dashboard redirect component
 * Automatically redirects users to their role-specific dashboard
 * This handles old bookmarks or links to /dashboard
 */
export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const token = localStorage.getItem('auth_token');
    const authRole = localStorage.getItem('auth_role');
    const userStr = localStorage.getItem('auth_user');

    // If not logged in, redirect to login
    if (!token) {
      navigate('/individual-login', { replace: true });
      return;
    }

    // Handle university users
    if (authRole === 'UNIVERSITY') {
      navigate('/university/dashboard', { replace: true });
      return;
    }

    // Handle individual users
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const dashboardUrls = {
          'ADMIN': '/admin/dashboard',
          'STUDENT': '/student/dashboard',
          'WARDEN': '/warden/dashboard',
          'STAFF': '/staff/dashboard'
        };
        
        const dashboardUrl = dashboardUrls[user.userType];
        if (dashboardUrl) {
          navigate(dashboardUrl, { replace: true });
        } else {
          // Fallback to student dashboard if userType is unknown
          navigate('/student/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
        navigate('/individual-login', { replace: true });
      }
    } else {
      navigate('/individual-login', { replace: true });
    }
  }, [navigate]);

  // Show loading spinner while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828]"></div>
    </div>
  );
}
