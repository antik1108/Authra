import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function WaitingApproval() {
  const navigate = useNavigate();
  const [loginPath, setLoginPath] = useState('/individual-login');

  useEffect(() => {
    // Determine the correct login path based on stored auth_role
    const authRole = localStorage.getItem('auth_role');
    if (authRole === 'UNIVERSITY') {
      setLoginPath('/university-login');
    } else {
      setLoginPath('/individual-login');
    }

    // Add animation class to body
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#C62828]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C62828]/3 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          {/* Animated clock icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-[#C62828]/10 rounded-full animate-ping"></div>
              <div className="relative bg-gradient-to-br from-[#B71C1C] to-[#D32F2F] p-6 rounded-full">
                <Clock className="w-16 h-16 text-white animate-pulse" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Registration Submitted!
            </h1>
            <p className="text-lg text-gray-600">
              Your account is currently under review
            </p>
          </div>

          {/* Status message */}
          <div className="bg-gradient-to-r from-[#C62828]/5 to-[#D32F2F]/5 border-l-4 border-[#C62828] rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-[#C62828] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#C62828] rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                    <span>Your registration details are being reviewed by the appropriate authority</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#C62828] rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                    <span>Once approved, you'll be able to log in and access your dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-[#C62828] rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                    <span>This process typically takes 1-2 business days</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Loading animation */}
          <div className="flex justify-center items-center gap-2 mb-8">
            <div className="w-3 h-3 bg-[#C62828] rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-[#C62828] rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-[#C62828] rounded-full animate-bounce delay-200"></div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#B71C1C] to-[#C62828] text-white rounded-xl font-semibold hover:from-[#C62828] hover:to-[#D32F2F] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
            <button
              onClick={() => navigate(loginPath, { replace: true })}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#C62828] text-[#C62828] rounded-xl font-semibold hover:bg-[#C62828] hover:text-white transition-all"
            >
              Try Login Again
            </button>
          </div>

          {/* Footer note */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Need help? Contact your institution's administrator
          </p>
        </div>
      </div>

      <style jsx>{`
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-700 {
          animation-delay: 0.7s;
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-0.75rem);
          }
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </div>
  );
}
