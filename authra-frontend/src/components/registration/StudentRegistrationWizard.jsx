import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../utils/api';
import Button from '../ui/Button';
import StudentStepIndicator from './StudentStepIndicator';
import Step1StudentPersonal from './Step1StudentPersonal';
import Step2StudentUniversity from './Step2StudentUniversity';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { 
  validateStudentStep1, 
  validateStudentStep2
} from '../../utils/validation';

export default function StudentRegistrationWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);

  // Get preselected values from login page navigation state
  const preselectedUniversity = location.state?.preselectedUniversity;
  const preselectedUserType = location.state?.preselectedUserType;

  const lockedUserType = !!preselectedUserType; // if came from login page, don't allow change in Step2

  const [formData, setFormData] = useState({
    // Step 1
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    gender: '',

    // Step 2
    universityId: preselectedUniversity || '',
    userType: preselectedUserType || 'STUDENT',
    studentId: '',
    employeeId: '',
    program: '',
    department: '',
    position: '',
    hostelName: ''
  });

  // Fetch universities for selection
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const data = await api.get('/auth/universities');
        setUniversities(Array.isArray(data) ? data : (data?.universities || []));
        if ((Array.isArray(data) ? data : data?.universities)?.length) {
          const list = Array.isArray(data) ? data : data.universities;
          // Only set default university if not preselected
          if (!preselectedUniversity) {
            setFormData(f => ({ ...f, universityId: list[0].id }));
          }
        }
      } catch (e) {
        console.error('Failed to load universities', e);
      } finally {
        setLoadingUniversities(false);
      }
    };
    fetchUniversities();
  }, [preselectedUniversity]);

  const validateCurrentStep = () => {
    let stepErrors = {};
    switch (step) {
      case 1:
        stepErrors = validateStudentStep1(formData);
        break;
      case 2:
        stepErrors = validateStudentStep2(formData);
        break;
      default:
        break;
    }
    return { errors: stepErrors, isValid: Object.keys(stepErrors).length === 0 };
  };

  const handleNext = () => {
    const validation = validateCurrentStep();
    setErrors(validation.errors);
    setShowErrors(true);
    
    if (validation.isValid) {
      setStep(s => Math.min(2, s + 1));
      setShowErrors(false);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setStep(s => Math.max(1, s - 1));
    setErrors({});
    setShowErrors(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateCurrentStep();
    setErrors(validation.errors);
    setShowErrors(true);
    
    if (!validation.isValid) return;
    setIsSubmitting(true);
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber || undefined,
        gender: formData.gender || undefined,
        studentId: formData.userType === 'STUDENT' ? formData.studentId : undefined,
        employeeId: ['FACULTY','STAFF','ADMIN','WARDEN'].includes(formData.userType) ? formData.employeeId : undefined,
        userType: formData.userType,
        universityId: formData.universityId,
        program: formData.userType === 'STUDENT' || formData.userType === 'FACULTY' ? (formData.program || undefined) : undefined,
        department: formData.userType === 'STAFF' ? (formData.department || undefined) : undefined,
        position: formData.userType === 'ADMIN' ? (formData.position || undefined) : undefined,
        hostelName: formData.userType === 'WARDEN' ? (formData.hostelName || undefined) : undefined
      };

      await api.post('/auth/register-user', payload);
      // Don't store token yet - user needs approval first
      // After successful registration, redirect to waiting page
      alert('🎉 Registration submitted successfully!');
      navigate('/waiting-approval', { replace: true });
    } catch (error) {
      console.error('Student registration error', error);
      alert(`❌ Registration failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-4 sm:py-6 lg:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="relative pt-6">
            <button
              onClick={() => navigate('/')}
              className="absolute left-0 top-0 inline-flex items-center text-sm text-gray-600 hover:text-[#C62828] transition-colors"
              aria-label="Back to Home"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Home
            </button>
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Create Your Account</h1>
              <p className="text-sm sm:text-base text-gray-600">Join the parcel management platform in just a few steps</p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-[#B71C1C] via-[#C62828] to-[#D32F2F] px-4 sm:px-6 lg:px-8 py-6">
            <StudentStepIndicator step={step} />
          </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 lg:p-10 bg-white">
              {step === 1 && (
                <Step1StudentPersonal
                  formData={formData}
                  setFormData={setFormData}
                  errors={showErrors ? errors : {}}
                />
              )}

              {step === 2 && (
                <Step2StudentUniversity
                  formData={formData}
                  setFormData={setFormData}
                  errors={showErrors ? errors : {}}
                  universities={universities}
                  loadingUniversities={loadingUniversities}
                  lockedUserType={lockedUserType}
                />
              )}

              {/* Navigation Buttons */}
              <div className="mt-6 pt-5 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  {step > 1 ? (
                    <Button
                      type="button"
                      onClick={handlePrev}
                      variant="secondary"
                      size="md"
                      className="flex items-center"
                    >
                      Previous
                    </Button>
                  ) : <div></div>}

                  {step < 2 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      variant="primary"
                      size="md"
                      className="flex items-center"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={isSubmitting}
                      className="flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : 'Create Account'}
                    </Button>
                  )}
                </div>

                <div className="text-center text-xs sm:text-sm text-gray-600 mt-4">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/individual-login')}
                    className="text-[#C62828] hover:underline"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            </form>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm font-medium text-gray-500">Step {step} of 2 - {step === 2 ? '100' : '50'}% Complete</p>
        </div>
      </div>
    </div>
  );
}
