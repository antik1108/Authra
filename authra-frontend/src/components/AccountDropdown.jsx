import React, { useRef, useState, useMemo } from 'react';
import { User, UserCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AccountDropdown() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('auth_user') || 'null');
    } catch { return null; }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_role');
    navigate('/individual-login'); // You may want to make this dynamic
  };

  React.useEffect(() => {
    const handler = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  return (
    <div ref={profileMenuRef} className="relative">
      <button onClick={() => setShowProfileMenu(s => !s)} className="hover:opacity-90 rounded-full transition-all" aria-label="Account menu">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-lg hover:shadow-xl">
          <User className="w-5 h-5 text-white" />
        </div>
      </button>
      {showProfileMenu && (
        <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-md">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500">{user.studentId || user.employeeId || 'ID not set'}</p>
              </div>
            </div>
          </div>
          <div className="py-2">
            <button onClick={() => { setShowProfileMenu(false); document.getElementById('user-profile-section')?.scrollIntoView({ behavior: 'smooth' }); }} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"><UserCircle className="w-5 h-5 text-gray-600" /></div>
              <div>
                <p className="text-sm font-medium text-gray-900">View Profile</p>
                <p className="text-xs text-gray-500">Manage your profile</p>
              </div>
            </button>
            <button onClick={handleLogout} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition-colors text-left">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center"><LogOut className="w-5 h-5 text-red-600" /></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Log Out</p>
                <p className="text-xs text-gray-500">Logout from your account</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
