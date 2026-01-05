import React, { useEffect, useState, useRef } from 'react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Bell, X, UserCircle, LogOut, Copy, Check, Shield, Users, CheckCircle, XCircle, User, Calendar } from 'lucide-react';
import AccountDropdown from '../components/AccountDropdown';

// Pending Admins Approval Component
function PendingAdminsSection() {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  const fetchPendingAdmins = async () => {
    try {
      setLoading(true);
      const data = await api.get('/auth/pending-approvals', { auth: true });
      setPendingAdmins(data.pendingUsers || []);
    } catch (error) {
      console.error('Failed to fetch pending admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId, action) => {
    try {
      setProcessingId(userId);
      await api.post('/auth/approve-user', { userId, action }, { auth: true });
      
      // Animate removal
      const element = document.getElementById(`admin-row-${userId}`);
      if (element) {
        element.style.transition = 'all 0.5s ease-out';
        element.style.opacity = '0';
        element.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
          setPendingAdmins(prev => prev.filter(u => u.id !== userId));
        }, 500);
      }
      
      alert(`Admin ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Approval action failed:', error);
      alert(error.message || 'Failed to process approval');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-[#C62828] mb-6">Pending Admin Approvals</h2>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#C62828]">Pending Admin Approvals</h2>
        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
          {pendingAdmins.length} pending
        </span>
      </div>

      {pendingAdmins.length === 0 ? (
        <div className="border border-gray-200 rounded-lg p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600">No pending admins to approve</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingAdmins.map(admin => {
            const isPending = processingId === admin.id;
            
            return (
              <div
                key={admin.id}
                id={`admin-row-${admin.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-orange-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{admin.name}</h3>
                      <div className="flex items-center gap-2 flex-wrap text-sm">
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-semibold">ADMIN</span>
                        {admin.employeeId && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                            Emp ID: {admin.employeeId}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 truncate">{admin.identifier}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>Registered: {new Date(admin.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApproval(admin.id, 'APPROVE')}
                      disabled={isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleApproval(admin.id, 'REJECT')}
                      disabled={isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>

                {/* Additional Info */}
                {admin.additionalInfo && admin.additionalInfo.position && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
                    <div className="flex items-start gap-1">
                      <span className="font-semibold text-gray-700">Position:</span>
                      <span>{admin.additionalInfo.position}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function UniversityDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const [copiedField, setCopiedField] = useState(null);
  const [staff, setStaff] = useState({ ADMIN: [], WARDEN: [], STAFF: [] });
  const [staffError, setStaffError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/auth/me-university', { auth: true });
        setData(res);
      } catch (e) {
        console.error('Failed to load university dashboard', e);
      }
    };
    fetchData();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/auth/notifications', { auth: true });
      setNotifications(res.notifications || []);
      setUnread(res.unread || 0);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const u = data?.university;

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_role');
    navigate('/university-login');
  };

  const copy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Fetch staff list (admins / wardens / staff)
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setStaffError(null);
        const res = await api.get('/auth/university-staff', { auth: true });
        // Ensure staff object always has ADMIN, WARDEN, STAFF keys
        const safeStaff = { ADMIN: [], WARDEN: [], STAFF: [], ...(res.staff || {}) };
        setStaff(safeStaff);
      } catch (e) {
        console.error('Staff fetch error', e);
        setStaffError(e.message || 'Failed to load staff');
      }
    };
    fetchStaff();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white relative">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">University Dashboard</h1>
          <div className="flex items-center gap-4" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(s => !s)}
              className="relative p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Notifications"
            >
              <Bell className="w-6 h-6 text-gray-700" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-semibold rounded-full px-1.5 py-0.5">{unread}</span>
              )}
            </button>
            <AccountDropdown />
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-red-50 transition"
              aria-label="Logout"
            >
              <LogOut className="w-6 h-6 text-red-600" />
            </button>
          </div>
          {showNotifications && (
            <div className="absolute right-5 top-16 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4 text-gray-500" /></button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y">
                {notifications.length === 0 && (
                  <p className="text-xs text-gray-500 p-4">No notifications</p>
                )}
                {notifications.map(n => (
                  <div key={n.id} className="p-4 hover:bg-gray-50">
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">{n.type.replace(/_/g,' ')}</p>
                    <p className="text-sm font-medium text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8 space-y-8">
        {u && (
          <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-3xl shadow-lg overflow-hidden">
            {/* Header Section with Logo and Name */}
            <div className="bg-gradient-to-r from-[#C62828] to-[#8B1F1F] p-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {u.logoUrl ? (
                    <img src={u.logoUrl} alt={u.universityName} className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-lg" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-white/10 backdrop-blur-sm border-2 border-white/20 shadow-lg flex items-center justify-center">
                      <UserCircle className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl md:text-3xl font-bold text-white">{u.universityName}</h3>
                    <button onClick={() => copy(u.universityName,'uname')} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Copy university name">
                      {copiedField === 'uname' ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4 text-white/70" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-white/90 text-sm font-medium">{u.institutionType}</span>
                    {u.establishedYear && (
                      <>
                        <span className="text-white/40">•</span>
                        <span className="text-white/80 text-sm">Est. {u.establishedYear}</span>
                      </>
                    )}
                    {u.isVerified && (
                      <>
                        <span className="text-white/40">•</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-green-500/20 border border-green-300/30 text-green-100 text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Admin Info Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-[#C62828]" />
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Administrator</h4>
                  </div>
                  <p className="text-xl font-bold text-gray-900 mb-1">{u.adminName}</p>
                  <p className="text-sm text-gray-600 mb-3">{u.adminPosition}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="truncate">{u.adminEmail}</span>
                    <button onClick={() => copy(u.adminEmail,'aemail')} className="p-1 rounded hover:bg-gray-100 flex-shrink-0" title="Copy email">
                      {copiedField === 'aemail' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                {/* Contact Info Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="w-5 h-5 text-[#C62828]" />
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Contact Details</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 w-16">Main:</span>
                      <span className="text-base font-semibold text-gray-900">{u.contactNumber}</span>
                    </div>
                    {u.supportContact && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 w-16">Support:</span>
                        <span className="text-sm text-gray-700">{u.supportContact}</span>
                      </div>
                    )}
                    {u.website && (
                      <div className="pt-2">
                        <a 
                          href={/^https?:/i.test(u.website) ? u.website : `https://${u.website}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-sm text-[#C62828] hover:underline font-medium flex items-center gap-1"
                        >
                          {u.website}
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-[#C62828]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Location</h4>
                  </div>
                  <p className="text-base font-semibold text-gray-900 mb-1">{u.addressLine1}</p>
                  {u.addressLine2 && <p className="text-sm text-gray-600 mb-1">{u.addressLine2}</p>}
                  <p className="text-sm text-gray-600">{u.city}, {u.state}</p>
                  <p className="text-sm text-gray-600">{u.country} - {u.zipCode}</p>
                </div>
              </div>

              {/* Bottom Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Accreditation */}
                {u.accreditationInfo && (
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Accreditation</p>
                    <p className="text-sm font-medium text-gray-900">{u.accreditationInfo}</p>
                  </div>
                )}

                {/* Students */}
                {u.numberOfStudents && (
                  <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-4 border border-purple-100">
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{u.numberOfStudents.toLocaleString()}</p>
                  </div>
                )}

                {/* Proof Document */}
                <div className="bg-gradient-to-br from-orange-50 to-white rounded-lg p-4 border border-orange-100">
                  <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">Proof Document</p>
                  {u.proofOfInstitutionUrl ? (
                    <a href={u.proofOfInstitutionUrl} target="_blank" rel="noreferrer" className="text-sm text-[#C62828] font-semibold hover:underline flex items-center gap-1">
                      View Document
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400">Not uploaded</p>
                  )}
                </div>

                {/* Registration Date */}
                <div className="bg-gradient-to-br from-green-50 to-white rounded-lg p-4 border border-green-100">
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Registered</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Pending Admins Approval Section */}
        <PendingAdminsSection />

        {/* Staff Directory */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#C62828] flex items-center gap-2"><Users className="w-7 h-7 text-[#C62828]" /> Campus Staff</h2>
            {staffError && <p className="text-xs text-red-600">{staffError}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['ADMIN','WARDEN','STAFF'].map(role => {
              const list = staff[role] || [];
              return (
                <div key={role} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-800 tracking-wide">{role.charAt(0)+role.slice(1).toLowerCase()}</h3>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">{list.length}</span>
                  </div>
                  {list.length === 0 && <p className="text-xs text-gray-400">No {role.toLowerCase()}s added yet.</p>}
                  <ul className="space-y-3">
                    {list.map(person => (
                      <li key={person.id} className="group p-3 rounded-lg border border-gray-200 hover:border-[#C62828] hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{person.firstName} {person.lastName}</p>
                            <p className="text-[11px] uppercase tracking-wide text-gray-500">{person.userType}</p>
                          </div>
                          {person.employeeId && <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{person.employeeId}</span>}
                        </div>
                        <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="truncate max-w-[160px]" title={person.email}>{person.email}</span>
                            <button onClick={() => copy(person.email,`email-${person.id}`)} className="p-0.5 rounded hover:bg-gray-200" title="Copy email">
                              {copiedField === `email-${person.id}` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                            </button>
                          </div>
                          {person.phoneNumber && (
                            <div className="flex items-center gap-1">
                              <span>{person.phoneNumber}</span>
                              <button onClick={() => copy(person.phoneNumber,`phone-${person.id}`)} className="p-0.5 rounded hover:bg-gray-200" title="Copy phone">
                                {copiedField === `phone-${person.id}` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                              </button>
                            </div>
                          )}
                          <p className="text-[10px] text-gray-400">Added {new Date(person.createdAt).toLocaleDateString()}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
