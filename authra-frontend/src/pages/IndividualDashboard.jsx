import React, { useEffect, useState, useMemo, useRef } from 'react';
/* eslint-disable no-unused-vars */
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Search, Package, RefreshCw, Clock, CheckCircle, User, Copy, Check, LogOut, UserCircle, Bell, X } from 'lucide-react';

function StatusBadge({ status }) {
  const map = {
    ARRIVED: { label: 'Arrived', color: 'bg-blue-100 text-blue-600 border-blue-200' },
    PICKED_UP: { label: 'Picked Up', color: 'bg-green-100 text-green-700 border-green-200' }
  };
  const meta = map[status] || { label: status, color: 'bg-gray-100 text-gray-600 border-gray-200' };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${meta.color}`}>{meta.label}</span>;
}

function StatCard({ icon: IconComponent, label, value, accent }) {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${accent}`}><IconComponent className="w-6 h-6 text-white" /></div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
/* eslint-enable no-unused-vars */

export default function IndividualDashboard() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [copiedField, setCopiedField] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [polling] = useState(true); // reserved for future toggle of notification polling
  const profileMenuRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('auth_user') || 'null');
    } catch { return null; }
  }, []);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_role');
    navigate('/individual-login');
  };

  useEffect(() => {
    const handler = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setShowProfileMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadNotifications = async (opts = { markIfOpen: true }) => {
    try {
      const data = await api.get('/auth/notifications', { auth: true });
      setNotifications(data.notifications || []);
      const newUnread = (data.unread || 0);
      // If panel open, immediately mark as read (user can see them)
      if (showNotifications && newUnread > 0 && opts.markIfOpen) {
        try {
          await api.post('/auth/notifications/mark-read', {}, { auth: true });
          const readNow = (data.notifications || []).map(n => ({ ...n, isRead: true }));
          setNotifications(readNow);
          setUnread(0);
        } catch (err) {
          console.error('Auto mark-read failed', err);
          setUnread(newUnread); // keep count if failed
        }
      } else {
        setUnread(newUnread);
      }
    } catch (e) {
      console.error('Notifications error', e);
    }
  };

  useEffect(() => {
    // initial load; we intentionally do not include loadNotifications in deps to avoid recreating interval
    loadNotifications({ markIfOpen: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll for new notifications every 30s
  useEffect(() => {
    if (!polling) return;
    const id = setInterval(() => {
      loadNotifications({ markIfOpen: true });
    }, 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polling, showNotifications]);

  useEffect(() => {
    const fetchParcels = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get('/parcels/my-parcels', { auth: true });
        setParcels(data.parcels || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchParcels();
  }, []);
  // Aggregate stats
  const stats = useMemo(() => ({
    total: parcels.length,
    arrived: parcels.filter(p => p.status === 'ARRIVED').length,
    picked: parcels.filter(p => p.status === 'PICKED_UP').length
  }), [parcels]);

  // Filtered list for table
  const filtered = useMemo(() => parcels.filter(p => {
    const matchesFilter = filter === 'ALL' || p.status === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [p.trackingNumber, p.senderName, p.receiverName, p.description].some(v => (v || '').toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  }), [parcels, filter, search]);

  // Recent approval parcels (READY_FOR_PICKUP) not yet placed (no fallback marker) within last 10 days
  const approvalParcels = useMemo(() => {
    const cutoff = Date.now() - 10 * 24 * 60 * 60 * 1000;
    return parcels.filter(p => {
      const arrived = p.arrivedAt ? new Date(p.arrivedAt).getTime() : 0;
      if (arrived < cutoff) return false;
      if (p.status !== 'READY_FOR_PICKUP') return false;
      if (p.note && p.note.includes('__PLACED__')) return false;
      return true;
    });
  }, [parcels]);
  async function handlePlaceParcel(p) {
    try {
      const resp = await api.post(`/parcels/${p.id}/place`, {}, { auth: true });
      if (resp.fallbackPlaced) {
        // Simulated status using note marker; treat as PLACED in UI
        setParcels(prev => prev.map(x => x.id === p.id ? { ...x, status: 'PLACED' } : x));
      } else if (resp.parcel) {
        setParcels(prev => prev.map(x => x.id === p.id ? { ...x, status: resp.parcel.status || 'PLACED' } : x));
      }
    } catch (e) {
      alert(e?.message || 'Failed to place parcel. Try again later.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white relative">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Parcel Dashboard</h1>
          {user && (
            <div className="flex items-center gap-3">
              <div ref={notifRef} className="relative">
                <button onClick={async () => {
                  const opening = !showNotifications;
                  setShowNotifications(o => !o);
                  if (opening) {
                    // Fresh load when opening to minimize race conditions
                    await loadNotifications({ markIfOpen: false });
                    if (unread > 0) {
                      try {
                        await api.post('/auth/notifications/mark-read', {}, { auth: true });
                        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                        setUnread(0);
                      } catch (e) {
                        console.error('Failed to persist mark-read', e);
                        // leave unread unchanged so user sees badge again after closing
                      }
                    }
                  }
                }} className="relative p-2 rounded-full hover:bg-gray-100 transition" aria-label="Notifications">
                  <Bell className="w-6 h-6 text-gray-700" />
                  {unread > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-semibold rounded-full px-1.5 py-0.5">{unread}</span>}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                      <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                      <div className="flex items-center gap-2">
                        <button onClick={async () => {
                          try {
                            await api.post('/auth/notifications/cleanup', {}, { auth: true });
                            await loadNotifications({ markIfOpen: false });
                          } catch (e) { console.error('Cleanup notifications failed', e); }
                        }} className="text-[10px] px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600">Clear Old</button>
                        <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4 text-gray-500" /></button>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y">
                      {notifications.length === 0 && <p className="text-xs text-gray-500 p-4">No notifications</p>}
                      {notifications.map(n => (
                        <div key={n.id} className={`p-4 hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50/40' : ''}`} onClick={async () => {
                          if (!n.isRead) {
                            try {
                              await api.post(`/auth/notifications/${n.id}/read`, {}, { auth: true });
                              setNotifications(prev => prev.map(p => p.id === n.id ? { ...p, isRead: true } : p));
                              setUnread(u => Math.max(0, u - 1));
                            } catch (err) {
                              console.error('Single mark-read failed', err);
                            }
                          }
                        }}>
                          <p className="text-xs uppercase tracking-wide text-gray-400 mb-1 flex items-center gap-2">
                            {n.type.replace(/_/g,' ')}
                            {!n.isRead && <span className="inline-block w-2 h-2 rounded-full bg-blue-500" aria-label="Unread" />}
                          </p>
                          <p className="text-sm font-medium text-gray-800">{n.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                          {n.createdAt && <p className="text-[10px] text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
            </div>
          )}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 py-8 space-y-10">
        {user && user.university && (
          <div id="user-profile-section" className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-[#C62828] mb-6">User Details</h2>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-white shadow-lg flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-3">{user.firstName} {user.lastName}</h3>
                {user.studentId && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-600">Enroll No-</span>
                    <span className="text-lg font-medium text-gray-700">{user.studentId}</span>
                    <button onClick={() => copyToClipboard(user.studentId, 'enrollment')} className="p-1 hover:bg-gray-100 rounded transition-colors ml-1" title="Copy enrollment number">
                      {copiedField === 'enrollment' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {user.phoneNumber && (
                    <div className="border-l-2 border-gray-300 pl-4">
                      <p className="text-xs text-gray-500 mb-1">Phone No.</p>
                      <p className="text-base font-medium text-gray-900">{user.phoneNumber}</p>
                    </div>
                  )}
                  {user.email && (
                    <div className="border-l-2 border-gray-300 pl-4">
                      <p className="text-xs text-gray-500 mb-1">Email Id</p>
                      <p className="text-base font-medium text-gray-900 truncate" title={user.email}>{user.email}</p>
                    </div>
                  )}
                  {user.program && (
                    <div className="border-l-2 border-gray-300 pl-4">
                      <p className="text-xs text-gray-500 mb-1">Program</p>
                      <p className="text-base font-medium text-gray-900" title={user.program}>{user.program}</p>
                    </div>
                  )}
                  {user.gender && (
                    <div className="border-l-2 border-gray-300 pl-4">
                      <p className="text-xs text-gray-500 mb-1">Gender</p>
                      <p className="text-base font-medium text-gray-900" title={user.gender}>{user.gender.charAt(0) + user.gender.slice(1).toLowerCase()}</p>
                    </div>
                  )}
                  <div className="border-l-2 border-gray-300 pl-4">
                    <p className="text-xs text-gray-500 mb-1">Links</p>
                    <p className="text-base text-gray-400">No social links</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={Package} label="Total Parcels" value={stats.total} accent="bg-[#C62828]" />
          <StatCard icon={Clock} label="Arrived" value={stats.arrived} accent="bg-blue-600" />
          <StatCard icon={CheckCircle} label="Picked Up" value={stats.picked} accent="bg-green-600" />
        </div>
        {approvalParcels.length > 0 && (
          <div className="bg-white border border-[#C62828]/30 rounded-2xl shadow-sm p-6 w-full">
            <h2 className="text-xl font-bold text-[#C62828] mb-4">Parcels Ready For Your Approval</h2>
            <p className="text-xs text-gray-600 mb-6">Confirm these parcels so staff can finalize processing. Recent parcels only (last 10 days).</p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {approvalParcels.map(p => (
                <div key={p.id} className="border rounded-xl p-4 flex flex-col gap-3 bg-gradient-to-br from-white to-red-50/40">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800 truncate" title={p.organization || 'Parcel'}>{p.organization || 'Parcel'}</span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold">Ready</span>
                  </div>
                  <div className="text-[11px] text-gray-600 space-y-1">
                    <p className="flex flex-wrap gap-x-4 gap-y-1">
                      {p.orderId && <span><span className="font-medium text-gray-700">Order:</span> {p.orderId}</span>}
                      {p.trackingNumber && <span><span className="font-medium text-gray-700">Tracking:</span> {p.trackingNumber}</span>}
                      {p.arrivedAt && <span><span className="font-medium text-gray-700">Arrived:</span> {new Date(p.arrivedAt).toLocaleString(undefined,{ day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}</span>}
                      {p.note && p.note !== 'false' && !p.note.includes('__PLACED__') && <span><span className="font-medium text-gray-700">Note:</span> {p.note}</span>}
                    </p>
                  </div>
                  {p.photoUrl && <a href={p.photoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#C62828] hover:underline">View Photo</a>}
                  <button onClick={() => handlePlaceParcel(p)} className="mt-auto inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#C62828] text-white text-xs font-semibold hover:bg-[#b22222] focus:outline-none focus:ring-2 focus:ring-[#C62828]/40">
                    Take My Order For Approval
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-5 border-b flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="flex gap-2 flex-wrap text-xs font-medium">
              {['ALL','ARRIVED','PICKED_UP'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${filter === f ? 'bg-[#C62828] text-white border-[#C62828]' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}>{f === 'ALL' ? 'All' : f.replace(/_/g,' ').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase())}</button>
              ))}
            </div>
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parcels…" className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]" />
            </div>
            <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            {loading && <div className="p-6 text-sm text-gray-500">Loading parcels…</div>}
            {error && !loading && <div className="p-6 text-sm text-red-600">{error}</div>}
            {!loading && !error && filtered.length === 0 && <div className="p-6 text-sm text-gray-500">No parcels match your criteria.</div>}
            {!loading && !error && filtered.length > 0 && (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 border-b">
                    <th className="px-5 py-3 font-medium">Tracking #</th>
                    <th className="px-5 py-3 font-medium">Sender</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Latest Update</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{p.trackingNumber}</td>
                      <td className="px-5 py-3 text-gray-700">{p.senderName || '—'}</td>
                      <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-3 text-gray-500">{p.trackingHistory?.[0]?.status ? <span>{p.trackingHistory[0].status.replace(/_/g,' ')}</span> : '—'}</td>
                      <td className="px-5 py-3">{p.status === 'ARRIVED' && <span className="text-xs font-medium text-blue-600">Available for pickup</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
