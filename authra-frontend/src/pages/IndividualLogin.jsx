import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { api } from '../utils/api';

export default function IndividualLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // form submit loading
  const [colleges, setColleges] = useState([]); // normalized {id, displayName, adminEmail}
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [collegeConfirmed, setCollegeConfirmed] = useState(false); // step gating
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [userType, setUserType] = useState('STUDENT');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Fetch colleges (shared with university login)
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setFetchError(null);
        const raw = await api.get('/auth/universities');
        const list = Array.isArray(raw) ? raw : (raw?.universities || []);
        const normalized = list.map(u => ({
          id: u.id,
          displayName: u.universityName || u.name,
          adminEmail: u.adminEmail,
          domain: u.adminEmail?.split('@')[1] || 'university.edu'
        }));
        setColleges(normalized);
        if (normalized.length) setSelectedCollege(normalized[0]);
        console.log('[IndividualLogin] fetched universities:', normalized);
      } catch (error) {
        console.error('Failed to fetch colleges:', error);
        setFetchError(error.message);
        const fallbackColleges = [
          { id: 'dev-1', displayName: 'Rishihood University', domain: 'rishihood.edu.in' },
          { id: 'dev-2', displayName: 'Delhi University', domain: 'du.ac.in' },
          { id: 'dev-3', displayName: 'Jawaharlal Nehru University', domain: 'jnu.ac.in' },
        ];
        setColleges(fallbackColleges);
        setSelectedCollege(fallbackColleges[0]);
      } finally {
        setLoadingColleges(false);
      }
    };
    fetchColleges();
  }, []);

  const handleCollegeChange = (e) => {
    const value = e.target.value;
    const college = colleges.find(c => c.id === value);
    setSelectedCollege(college || null);
    setFormData({ identifier: '', password: '' });
    setCollegeConfirmed(false);
    // Reset user type when changing university
    setUserType('STUDENT');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Choose whether identifier is email or phone (backend expects email field for login-user)
      const baseCreds = formData.identifier.includes('@')
        ? { email: formData.identifier }
        : { email: formData.identifier }; // Phone login placeholder

      const payload = {
        ...baseCreds,
        password: formData.password,
        universityId: selectedCollege?.id,
        userType
      };

      const res = await api.post('/auth/login-user', payload);
      
      // Check if user needs approval before allowing login
      if (res?.needsApproval) {
        navigate('/waiting-approval', { replace: true });
        return;
      }
      
      // Normal login flow - store token and user data
      if (res?.token) {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('auth_role', 'INDIVIDUAL');
        if (res.user) {
          localStorage.setItem('auth_user', JSON.stringify(res.user));
        }
      }
      
      // Navigate to the correct dashboard based on user type
      const dashboardUrls = {
        'ADMIN': '/admin/dashboard',
        'STUDENT': '/student/dashboard',
        'WARDEN': '/warden/dashboard',
        'STAFF': '/staff/dashboard'
      };
      const dashboardUrl = dashboardUrls[userType] || '/student/dashboard';
      navigate(dashboardUrl, { replace: true });
    } catch (err) {
      alert(`Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Placeholder for Google OAuth
    console.log('Google sign in clicked');
  };

  const computeBrandDisplay = () => {
    if (selectedCollege?.name && /rishihood/i.test(selectedCollege.name)) return 'RishiVerse';
    return 'Authra';
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 z-50 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:bg-gray-50 group"
        aria-label="Go back to home"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700 group-hover:text-[#C62828]" />
      </button>

      {/* Left Side - Welcome Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1556742400-b5b7c5129b7e?auto=format&fit=crop&w=1650&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
        <div className="relative z-10 flex flex-col justify-center px-10 xl:px-16 text-white">
          <div className="space-y-6 max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
              Welcome to<br />
              <span className="text-white font-extrabold">Authra</span>
            </h1>
            <p className="text-sm xl:text-base text-white/80 max-w-md">
              Sign in to manage your profile, preferences and activity.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-white">A</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{computeBrandDisplay()}</h2>
            </div>
          </div>

          {/* Step 1: College Selection */}
          {!collegeConfirmed && (
            <div className="space-y-6 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Select your college</h2>
                <p className="text-sm text-gray-600">Choose the registered institution to proceed.</p>
              </div>
              <Select
                label="Registered Universities"
                required
                value={selectedCollege?.id || ''}
                onChange={handleCollegeChange}
                options={colleges.map(c => ({ value: c.id, label: c.displayName || c.name }))}
                placeholder={loadingColleges ? 'Loading universities…' : 'Choose a university'}
                disabled={loadingColleges}
              />
              <Select
                label="User Type"
                required
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                options={[
                  { value: 'STUDENT', label: 'Student' },
                  { value: 'ADMIN', label: 'Admin' },
                  { value: 'WARDEN', label: 'Warden' },
                  { value: 'STAFF', label: 'Staff' }
                ]}
                placeholder="Select user type"
              />
              {fetchError && <p className="text-xs text-red-600">Error: {fetchError}</p>}
              <button
                type="button"
                disabled={!selectedCollege || loadingColleges || !userType}
                onClick={() => setCollegeConfirmed(true)}
                className="w-full bg-[#C62828] text-white py-3.5 rounded-lg font-semibold hover:bg-[#B71C1C] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C62828]"
              >
                {loadingColleges ? 'Loading…' : 'Continue'}
              </button>
              {(!selectedCollege || !userType) && !loadingColleges && (
                <p className="text-xs text-amber-600 text-center">Select a college and user type to enable Continue.</p>
              )}
            </div>
          )}

          {/* Sign In Header (Step 2) */}
          {collegeConfirmed && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Sign in to get started.</h2>
              <p className="text-xs text-gray-600">Institution: <span className="font-medium">{selectedCollege?.displayName}</span> • User Type: <span className="font-medium">{userType}</span></p>
            </div>
          )}

          {/* Google Sign In (Step 2 only) */}
          {collegeConfirmed && (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-6"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5"
              />
              <span className="text-sm font-medium text-gray-700">Continue with Google</span>
            </button>
          )}

          {/* Divider (Step 2 only) */}
          {collegeConfirmed && (
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>
          )}

          {/* Login Form (Step 2) */}
          {collegeConfirmed && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-800">
                Email or Phone <span className="text-red-500">*</span>
              </label>
              <input
                name="identifier"
                type="text"
                required
                value={formData.identifier}
                onChange={handleChange}
                placeholder="you@example.com or +91 98765 43210"
                autoComplete="username"
                className="w-full px-4 py-3.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-800">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full px-4 py-3.5 pr-12 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#C62828] rounded p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

              <div className="flex items-center justify-between gap-4 text-xs mt-3">
              <p className="text-gray-500 flex-shrink">
                Read our <a href="#" className="text-[#C62828] font-bold hover:underline">Terms of Service</a> for more information.
              </p>
              <a
                href="#"
                className="text-[#C62828] font-bold hover:underline whitespace-nowrap flex-shrink-0"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C62828] text-white py-4 rounded-xl font-semibold text-base hover:bg-[#B71C1C] transition-colors shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C62828]"
            >
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
            <div className="text-center text-xs text-gray-600 mt-3">
              Need an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register-individual', { 
                  state: { 
                    preselectedUniversity: selectedCollege?.id,
                    preselectedUserType: userType 
                  } 
                })}
                className="text-[#C62828] font-semibold hover:underline"
              >
                Register
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
