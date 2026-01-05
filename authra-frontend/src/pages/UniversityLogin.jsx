import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { api } from '../utils/api';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';

export default function UniversityLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [colleges, setColleges] = useState([]); // normalized array: {id, displayName, adminEmail, isVerified, domain?}
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [collegeConfirmed, setCollegeConfirmed] = useState(false); // step gating
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Fetch registered colleges on component mount
  React.useEffect(() => {
    const fetchColleges = async () => {
      try {
        setFetchError(null);
        const raw = await api.get('/auth/universities');
        const list = Array.isArray(raw) ? raw : (raw?.universities || []);
        const normalized = list.map(u => {
          const domain = u.adminEmail?.split('@')[1];
            return {
              id: u.id,
              displayName: u.universityName || u.name,
              adminEmail: u.adminEmail,
              isVerified: u.isVerified,
              domain,
              shortName: (u.universityName || u.name || '').split(' ')[0]
            };
        });
        setColleges(normalized);
        if (normalized.length) setSelectedCollege(normalized[0]);
        console.log('[UniversityLogin] fetched universities:', normalized);
      } catch (error) {
        console.error('Failed to fetch colleges:', error);
        setFetchError(error.message);
        // Fallback data for development
        const fallbackColleges = [
          { id: 'dev-1', displayName: 'Rishihood University', shortName: 'Rishihood', domain: 'rishihood.edu.in' },
          { id: 'dev-2', displayName: 'Delhi University', shortName: 'Delhi', domain: 'du.ac.in' },
          { id: 'dev-3', displayName: 'Jawaharlal Nehru University', shortName: 'JNU', domain: 'jnu.ac.in' },
        ];
        setColleges(fallbackColleges);
        setSelectedCollege(fallbackColleges[0]);
      } finally {
        setLoadingColleges(false);
      }
    };
    fetchColleges();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCollege) {
      alert('Please select a college');
      return;
    }
    try {
      const res = await api.post('/auth/login-university', {
        email: formData.email,
        password: formData.password,
        universityId: selectedCollege.id,
      });
      if (res?.token) {
        // CRITICAL: Clear any previous individual user data to prevent privacy leak
        localStorage.removeItem('auth_user');
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('auth_role', 'UNIVERSITY');
      }
      alert('Signed in successfully');
      navigate('/university/dashboard', { replace: true });
    } catch (err) {
      alert(`Login failed: ${err.message}`);
    }
  };

  const handleCollegeChange = (e) => {
    const value = e.target.value;
    const college = colleges.find(c => c.id === value);
    setSelectedCollege(college || null);
    // Reset email/password when college changes for clarity
    setFormData(prev => ({ ...prev, email: '', password: '' }));
    setCollegeConfirmed(false); // require re-confirmation if changed
  };

  const handleGoogleSignIn = () => {
    // Implement Google OAuth
    console.log('Google sign in clicked');
  };

  // Helper: brand display override (example mapping for screenshot styling)
  const computeBrandDisplay = () => {
    if (!selectedCollege) return 'Authra';
  const name = selectedCollege.displayName || selectedCollege.name || '';
    // Example custom mapping: Rishihood University -> RishiVerse
    if (/rishihood/i.test(name)) return 'RishiVerse';
    return name.split(' ')[0];
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
        {/* Background Image */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1686&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-10 xl:px-16 text-white">
          <div className="space-y-6 max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
              Welcome to<br />
              <span className="text-white font-extrabold">Authra</span>
            </h1>
            <p className="text-sm xl:text-base text-white/80">
              The details have already been shared with you via email.
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
              <span className="text-xl font-bold text-white">
                {selectedCollege?.shortName?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{computeBrandDisplay()}</h2>
            </div>
          </div>

          {/* Step 1: College Selection (shown if not confirmed) */}
          {!collegeConfirmed && (
            <div className="space-y-6 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Select your university</h2>
                <p className="text-sm text-gray-600">Choose the registered institution to proceed.</p>
              </div>
              {fetchError && (
                <p className="text-xs text-red-600">Error: {fetchError}</p>
              )}
              <Select
                label="Registered Universities"
                required
                value={selectedCollege?.id || ''}
                onChange={handleCollegeChange}
                options={colleges.map(c => ({ value: c.id, label: c.displayName || c.name }))}
                placeholder={loadingColleges ? 'Loading universities…' : 'Choose a university'}
                disabled={loadingColleges}
              />
              <button
                type="button"
                disabled={!selectedCollege || loadingColleges}
                onClick={() => setCollegeConfirmed(true)}
                className="w-full bg-[#C62828] text-white py-3.5 rounded-lg font-semibold hover:bg-[#B71C1C] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C62828]"
              >
                {loadingColleges ? 'Loading…' : 'Continue'}
              </button>
              
              {/* Register University Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Can't find your university?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register-university')}
                    className="text-[#C62828] font-semibold hover:underline focus:outline-none"
                  >
                    Register it here
                  </button>
                </p>
              </div>
              
              {!selectedCollege && !loadingColleges && !fetchError && (
                <p className="text-xs text-amber-600 text-center">No universities available yet.</p>
              )}
            </div>
          )}

          {/* Sign In Header (Step 2) */}
          {collegeConfirmed && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Sign in to get started.</h2>
              <p className="text-xs text-gray-600">Institution: <span className="font-medium">{selectedCollege?.displayName}</span></p>
            </div>
          )}

          {/* Google Sign In (Step 2 only) */}
          {selectedCollege && collegeConfirmed && (
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
              <span className="text-xs text-gray-500">@{selectedCollege.domain || selectedCollege.adminEmail?.split('@')[1]}</span>
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

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-800">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={selectedCollege ? `admin@${selectedCollege.domain || selectedCollege.adminEmail?.split('@')[1] || 'university.edu'}` : 'Select a university first'}
                disabled={!selectedCollege}
                className="w-full px-4 py-3.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9D0B2B] focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-800">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  disabled={!selectedCollege}
                  className="w-full px-4 py-3.5 pr-12 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9D0B2B] focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#9D0B2B] rounded p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms and Forgot Password */}
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

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={!selectedCollege || loadingColleges}
              className="w-full bg-[#C62828] text-white py-4 rounded-xl font-semibold text-base hover:bg-[#B71C1C] transition-colors shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C62828]"
            >
              Sign In
            </button>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
