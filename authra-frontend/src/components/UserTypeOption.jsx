
import { useNavigate } from 'react-router-dom';
import { Building2, Briefcase, User } from 'lucide-react';

function UserTypeOptions() {
  const navigate = useNavigate();
  return (
    <section id="register" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Registration Type
          </h2>
          <p className="text-xl text-gray-600">
            Select the option that best fits your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#C62828] hover:shadow-2xl transition-all cursor-pointer">
            <div className="bg-[#C62828]/10 group-hover:bg-[#C62828]/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-colors">
              <Building2 className="h-8 w-8 text-[#C62828]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">University</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Manage parcels across your entire campus with centralized tracking and analytics for students, faculty, and staff.
            </p>
            <button className="w-full bg-[#E95C28] text-white py-3 rounded-lg font-semibold hover:bg-[#D45521] transition-colors">
              Register University
            </button>
          </div>

          <div className="group bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#C62828] hover:shadow-2xl transition-all cursor-pointer">
            <div className="bg-[#E95C28]/10 group-hover:bg-[#E95C28]/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-colors">
              <Briefcase className="h-8 w-8 text-[#E95C28]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Workplace</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Streamline office deliveries with efficient tracking systems designed for corporate environments and teams.
            </p>
            <button className="w-full bg-[#E95C28] text-white py-3 rounded-lg font-semibold hover:bg-[#D45521] transition-colors">
              Register Workplace
            </button>
          </div>

          <div className="group bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#C62828] hover:shadow-2xl transition-all cursor-pointer">
            <div className="bg-[#C62828]/10 group-hover:bg-[#C62828]/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-colors">
              <User className="h-8 w-8 text-[#C62828]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Individual</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Track your personal deliveries with ease. Perfect for home users who want complete visibility of their parcels.
            </p>
            <button
              className="w-full bg-[#E95C28] text-white py-3 rounded-lg font-semibold hover:bg-[#D45521] transition-colors"
              onClick={() => navigate('/individual-login')}
            >
              Sign Up as Individual
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UserTypeOptions;
