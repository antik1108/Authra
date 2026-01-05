import { useState, useEffect, useMemo } from 'react';
import { CheckCircle, XCircle, User, Calendar } from 'lucide-react';
import { api } from '../utils/api';
import AccountDropdown from '../components/AccountDropdown';
import UserDetailsCard from '../components/UserDetailsCard';

export default function WardenDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Current logged in user
  const currentUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); } catch { return null; }
  }, []);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const data = await api.get('/auth/pending-approvals', { auth: true });
      setPendingUsers(data.pendingUsers || []);
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
      alert('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId, action) => {
    try {
      setProcessingId(userId);
      await api.post('/auth/approve-user', { userId, action }, { auth: true });
      
      // Animate removal
      const element = document.getElementById(`user-row-${userId}`);
      if (element) {
        element.style.transition = 'all 0.5s ease-out';
        element.style.opacity = '0';
        element.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
          setPendingUsers(prev => prev.filter(u => u.id !== userId));
        }, 500);
      }
      
      alert(`User ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Approval action failed:', error);
      alert(error.message || 'Failed to process approval');
    } finally {
      setProcessingId(null);
    }
  };

  const renderUserRow = (user) => {
    const isPending = processingId === user.id;
    
    return (
      <div
        key={user.id}
        id={`user-row-${user.id}`}
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
              <div className="flex items-center gap-2 flex-wrap text-sm">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                  {user.userType}
                </span>
                {user.studentId && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                    ID: {user.studentId}
                  </span>
                )}
                {user.enrollmentNo && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                    Enrollment: {user.enrollmentNo}
                  </span>
                )}
                {user.employeeId && (
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                    Emp ID: {user.employeeId}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1 truncate">{user.identifier}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <Calendar className="w-3 h-3" />
                <span>Registered: {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <button
              onClick={() => handleApproval(user.id, 'APPROVE')}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve</span>
            </button>
            <button
              onClick={() => handleApproval(user.id, 'REJECT')}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject</span>
            </button>
          </div>
        </div>

        {/* Additional Info */}
        {user.additionalInfo && Object.values(user.additionalInfo).some(val => val) && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600 grid grid-cols-2 gap-2">
            {user.additionalInfo.program && (
              <div className="flex items-start gap-1">
                <span className="font-semibold text-gray-700">Program:</span>
                <span>{user.additionalInfo.program}</span>
              </div>
            )}
            {user.additionalInfo.department && (
              <div className="flex items-start gap-1">
                <span className="font-semibold text-gray-700">Department:</span>
                <span>{user.additionalInfo.department}</span>
              </div>
            )}
            {user.additionalInfo.hostelName && (
              <div className="flex items-start gap-1">
                <span className="font-semibold text-gray-700">Hostel:</span>
                <span>{user.additionalInfo.hostelName}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#C62828]">Warden Dashboard</h1>

        {/* User Details */}
        {currentUser && (
          <div className="mb-8">
            <UserDetailsCard
              name={`${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()}
              role={currentUser.userType}
              idLabel={currentUser.employeeId ? 'Employee ID' : currentUser.studentId ? 'Enroll No.' : null}
              idValue={currentUser.employeeId || currentUser.studentId || null}
              phone={currentUser.phoneNumber}
              email={currentUser.email}
              extraLabel={currentUser.hostelName ? 'Hostel' : currentUser.department ? 'Department' : currentUser.program ? 'Program' : null}
              extraValue={currentUser.hostelName || currentUser.department || currentUser.program || null}
            />
          </div>
        )}

        {/* Pending Approvals Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Pending Students & Staff
            </h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {pendingUsers.length} pending
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading pending approvals...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map(renderUserRow)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}