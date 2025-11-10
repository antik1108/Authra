import React, { useState } from "react";

export default function IndividualLogin() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: handle login logic
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f5f5] to-[#ece9e6] px-4 sm:px-6">
  <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden md:h-[720px] mx-auto">
        {/* Left Side */}
  <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-b from-[#2b201e] to-[#2d2320] md:w-1/2 p-6 md:p-12 lg:p-16 relative">
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute rounded-full border border-[#ffffff22] w-[360px] h-[360px]" style={{zIndex:0}}></div>
              <div className="absolute rounded-full border border-[#ffffff18] w-[260px] h-[260px]" style={{zIndex:0}}></div>
              <h1 className="relative z-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white text-center leading-tight tracking-tight">
                Manage<br />your money
              </h1>
            </div>
            <img src="/phone-mockup.png" alt="Phone" className="w-56 sm:w-64 md:w-72 lg:w-80 drop-shadow-2xl transform -rotate-6" />
          </div>
        </div>
        {/* vertical divider for desktop */}
  <div className="hidden md:block w-1 bg-white/10" />
        {/* Right Side */}
  <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-10 md:p-12 lg:p-16 bg-white md:w-1/2">
          <div className="flex items-center justify-between w-full mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E95C28] via-[#F28A4D] to-[#C62828] flex items-center justify-center shadow-sm">
                {/* Logo dot */}
              </div>
              <span className="text-2xl font-semibold text-gray-900">Authra</span>
            </div>
            <a href="#" className="text-sm text-gray-600 hover:text-[#C62828] font-medium px-3 py-1 rounded-md hover:bg-gray-50">Sign Up</a>
          </div>
          <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Sign In</h2>
            <div className="mb-5">
              <input
                type="text"
                name="identifier"
                value={form.identifier}
                onChange={handleChange}
                placeholder="Email or Phone Number"
                className="w-full px-4 sm:px-5 py-3 rounded-full border border-gray-200 focus:border-[#E95C28] focus:ring-2 focus:ring-[#E95C28]/20 outline-none text-base sm:text-lg bg-gray-50 shadow-sm"
                autoComplete="username"
                required
              />
            </div>
            <div className="mb-3 relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full px-4 sm:px-5 py-3 rounded-full border border-gray-200 focus:border-[#E95C28] focus:ring-2 focus:ring-[#E95C28]/20 outline-none text-base sm:text-lg bg-gray-50 shadow-sm"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C62828] text-lg"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M4.5 4.5A10.5 10.5 0 0121 12c-1.5 2.5-4.5 6-9 6s-7.5-3.5-9-6a10.5 10.5 0 012.5-3.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.5 1.5-2.5 5-9.542 5-7.042 0-9.042-3.5-9.542-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mb-6 sm:mb-8 flex justify-between items-center">
              <a href="#" className="text-sm text-[#E95C28] hover:underline font-semibold">Forgot password?</a>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#E95C28] via-[#F28A4D] to-[#C62828] text-white text-base sm:text-lg font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#E95C28]/30 focus-visible:ring-offset-2"
            >
              <span>Sign In</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 12H6.75m0 0l4.5-4.5m-4.5 4.5l4.5 4.5" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
