import { useMemo, useEffect, useState, useRef } from 'react';
import UserDetailsCard from '../components/UserDetailsCard';
import AccountDropdown from '../components/AccountDropdown';
import { api } from '../utils/api';

export default function StaffDashboard() {
  // Current logged in user
  const currentUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); } catch { return null; }
  }, []);
  
  const token = useMemo(() => localStorage.getItem('auth_token') || '', []);

  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [organization, setOrganization] = useState('');
  const [orderId, setOrderId] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photoBlob, setPhotoBlob] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [loadingParcels, setLoadingParcels] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const searchDebounceRef = useRef(null);

  async function fetchParcels(params = {}) {
    setLoadingParcels(true);
    try {
      const qp = new URLSearchParams();
      if (params.status && params.status !== 'ALL') qp.append('status', params.status);
      if (params.search) qp.append('search', params.search);
      const data = await api.get(`/parcels/staff?${qp.toString()}`, { auth: true });
      setParcels(data.parcels || []);
    } catch (e) {
      console.error('Fetch parcels failed', e);
    } finally {
      setLoadingParcels(false);
    }
  }

  // Initial load
  // Combined effect with debounce for search & filter
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchParcels({ status: filterStatus, search: searchTerm });
    }, 300);
    return () => clearTimeout(searchDebounceRef.current);
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    let timeout;
    if (query && query.length >= 2) {
      timeout = setTimeout(async () => {
        try {
          const res = await api.get(`/students/suggest?query=${encodeURIComponent(query)}`, { auth: true });
          setSuggestions(res.results || []);
        } catch {
          setSuggestions([]);
        }
      }, 250);
    } else {
      setSuggestions([]);
    }
    return () => clearTimeout(timeout);
  }, [query, token]);

  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      setPhotoBlob(blob);
    }, 'image/jpeg', 0.85);
  }

  async function submitParcel() {
    if (!photoBlob) {
      alert('Please capture a photo.');
      return;
    }
    setSubmitting(true);
    try {
  const fd = new FormData();
      if (selectedStudent?.studentId) fd.append('studentId', selectedStudent.studentId);
      fd.append('studentName', selectedStudent?.name || studentName);
      fd.append('organization', organization);
      fd.append('orderId', orderId);
      fd.append('note', note);
      fd.append('photo', photoBlob, `parcel-${Date.now()}.jpg`);
  await api.postForm('/parcels', fd, { auth: true });
      // reset
      setShowModal(false);
      setSelectedStudent(null);
      setStudentName('');
      setOrganization('');
      setOrderId('');
      setNote('');
      setPhotoBlob(null);
      alert('Parcel registered');
    } catch (err) {
      alert(err?.message || 'Failed to register parcel');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white relative">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
          <AccountDropdown />
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-[#C62828]">Staff Dashboard</h1>
        
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
              extraLabel={currentUser.department ? 'Department' : currentUser.program ? 'Program' : currentUser.hostelName ? 'Hostel' : null}
              extraValue={currentUser.department || currentUser.program || currentUser.hostelName || null}
            />
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="flex flex-col gap-6 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 tracking-tight">Parcels</h2>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{loadingParcels ? 'Loading…' : `${parcels.length} total`}</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-stretch gap-2 w-full lg:w-auto">
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="appearance-none pr-8 pl-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C62828]/50 focus:border-[#C62828] transition"
                  >
                    <option value="ALL">All</option>
                    <option value="READY_FOR_PICKUP">Ready</option>
                    <option value="PLACED">Placed</option>
                    <option value="PICKED_UP">Picked Up</option>
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▼</span>
                </div>
                <div className="relative flex-1">
                  <label htmlFor="parcel-search" className="sr-only">Search parcels</label>
                  <input
                    id="parcel-search"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search name / order / phone / email / org"
                    className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C62828]/50 focus:border-[#C62828] transition"
                  />
                  <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
                </div>
                <button
                  onClick={() => { setShowModal(true); startCamera(); }}
                  className="whitespace-nowrap inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C62828] text-white text-sm font-semibold shadow-sm hover:bg-[#b22222] focus:outline-none focus:ring-2 focus:ring-[#C62828]/50 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                  New Parcel
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="bg-gray-100 text-gray-700 rounded">
                  <th className="text-left font-medium px-3 py-2">#</th>
                  <th className="text-left font-medium px-3 py-2">Student Name</th>
                  <th className="text-left font-medium px-3 py-2">Enrollment</th>
                  <th className="text-left font-medium px-3 py-2">Email</th>
                  <th className="text-left font-medium px-3 py-2">Phone</th>
                  <th className="text-left font-medium px-3 py-2">Organization</th>
                  <th className="text-left font-medium px-3 py-2">Order ID</th>
                  <th className="text-left font-medium px-3 py-2">Status</th>
                  <th className="text-left font-medium px-3 py-2">Arrived</th>
                  <th className="text-left font-medium px-3 py-2">Photo</th>
                </tr>
              </thead>
              <tbody>
                {loadingParcels && (
                  <tr><td colSpan={10} className="px-3 py-6 text-center text-gray-500">Loading parcels...</td></tr>
                )}
                {!loadingParcels && parcels.length === 0 && (
                  <tr><td colSpan={10} className="px-3 py-6 text-center text-gray-500">No parcels found.</td></tr>
                )}
                {!loadingParcels && parcels.map((p, idx) => {
                  const date = new Date(p.arrivedAt);
                  const dateStr = date.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                  return (
                    <tr key={p.id} className="bg-white shadow-sm hover:shadow-md transition rounded">
                      <td className="px-3 py-2 text-gray-500 text-xs w-10">{idx + 1}</td>
                      <td className="px-3 py-2 font-medium text-gray-800">{p.receiverName}</td>
                      <td className="px-3 py-2 text-gray-600 text-xs">{p.receiverStudentId || '-'}</td>
                      <td className="px-3 py-2 text-gray-600 text-xs">{p.receiverEmail || '-'}</td>
                      <td className="px-3 py-2 text-gray-600 text-xs">{p.receiverPhone || '-'}</td>
                      <td className="px-3 py-2 text-gray-700 text-xs">{p.organization || '-'}</td>
                      <td className="px-3 py-2 font-semibold text-gray-900 text-xs">{p.orderId || '-'}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold tracking-wide ${p.status === 'READY_FOR_PICKUP' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' : p.status === 'PLACED' ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-200' : p.status === 'PICKED_UP' ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-gray-50 text-gray-600 ring-1 ring-gray-200'}`}>{p.status === 'READY_FOR_PICKUP' ? 'READY' : p.status}</span>
                      </td>
                      <td className="px-3 py-2 text-gray-500 text-xs">{dateStr}</td>
                      <td className="px-3 py-2">
                        {p.photoUrl ? (
                          <a href={p.photoUrl} target="_blank" rel="noopener noreferrer" className="text-[#C62828] hover:underline text-xs">View</a>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">New Parcel</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Student Name</label>
                  <input value={query} onChange={e => { setQuery(e.target.value); setStudentName(e.target.value); setSelectedStudent(null); }} placeholder="Type name, email or enrollment" className="w-full border rounded-lg px-3 py-2" />
                  {suggestions.length > 0 && (
                    <div className="mt-2 border rounded-lg max-h-40 overflow-auto">
                      {suggestions.map(s => (
                        <button key={s.userId} onClick={() => { setSelectedStudent(s); setQuery(`${s.name}`); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-gray-500">{s.studentId || ''} {s.phoneNumber ? `• ${s.phoneNumber}` : ''} {s.email ? `• ${s.email}` : ''}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Enrollment No. (optional)</label>
                  <input value={selectedStudent?.studentId || ''} onChange={() => {}} readOnly className="w-full border rounded-lg px-3 py-2 bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email (optional)</label>
                  <input value={selectedStudent?.email || ''} onChange={() => {}} readOnly className="w-full border rounded-lg px-3 py-2 bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone (optional)</label>
                  <input value={selectedStudent?.phoneNumber || ''} onChange={() => {}} readOnly className="w-full border rounded-lg px-3 py-2 bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Organization</label>
                  <input value={organization} onChange={e => setOrganization(e.target.value)} placeholder="e.g., Amazon, Flipkart" className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Order ID</label>
                  <input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="Order ID from parcel" className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Parcel Note (optional)</label>
                  <input value={note} onChange={e => setNote(e.target.value)} placeholder="Any remarks" className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-2">Capture Photo</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                      <video ref={videoRef} className="w-full rounded-lg bg-black" />
                      <div className="mt-2 flex gap-2">
                        <button onClick={startCamera} className="px-3 py-2 bg-gray-200 rounded-lg">Start Camera</button>
                        <button onClick={capturePhoto} className="px-3 py-2 bg-[#C62828] text-white rounded-lg">Capture</button>
                      </div>
                    </div>
                    <div>
                      <canvas ref={canvasRef} className="w-full rounded-lg border" />
                      <p className="text-xs text-gray-500 mt-1">Preview appears here after capture.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button onClick={submitParcel} disabled={submitting} className="px-4 py-2 rounded-lg bg-[#C62828] text-white hover:bg-[#b22222] disabled:opacity-60">{submitting ? 'Submitting…' : 'Submit'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}