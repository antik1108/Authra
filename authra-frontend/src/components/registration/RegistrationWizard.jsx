import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Step1UniversityDetails from "./Step1UniversityDetails";
import Step2AddressInformation from "./Step2AddressInformation";
import Step3AdminDetails from "./Step3AdminDetails";
import StepIndicator from "./StepIndicator";
import Button from "../ui/Button";
import { validateStep1, validateStep2, validateStep3 } from "../../utils/validation";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { api } from "../../utils/api";

export default function RegistrationWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1
    universityName: "",
    institutionType: "",
    website: "",
    establishedYear: "",
    numberOfStudents: "",
    accreditationInfo: "",
    logo: null,
    proofOfInstitution: null,
    
    // Step 2
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    
    // Step 3
    adminName: "",
    adminPosition: "",
    adminEmail: "",
    contactNumber: "",
    supportContact: "",
    adminPassword: "",
    acceptTerms: false,
  });

  const validateCurrentStep = () => {
    let stepErrors = {};
    
    switch (step) {
      case 1:
        stepErrors = validateStep1(formData);
        break;
      case 2:
        stepErrors = validateStep2(formData);
        break;
      case 3:
        stepErrors = validateStep3(formData);
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
      setStep((s) => Math.min(3, s + 1));
      setShowErrors(false);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setStep((s) => Math.max(1, s - 1));
    setErrors({});
    setShowErrors(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateCurrentStep();
    setErrors(validation.errors);
    setShowErrors(true);
    
    if (!validation.isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Build payload expected by backend
      const payload = {
        universityName: formData.universityName,
        institutionType: formData.institutionType,
        website: formData.website || undefined,
        establishedYear: formData.establishedYear ? Number(formData.establishedYear) : undefined,
        numberOfStudents: formData.numberOfStudents ? Number(formData.numberOfStudents) : undefined,
        accreditationInfo: formData.accreditationInfo || undefined,
        // For now, pass URLs/null for files; file upload can be added later
        logoUrl: null,
        proofOfInstitutionUrl: null,
        // Address
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2 || undefined,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipCode: formData.zipCode,
        // Admin
        adminName: formData.adminName,
        adminPosition: formData.adminPosition,
        adminEmail: formData.adminEmail,
        contactNumber: formData.contactNumber,
        supportContact: formData.supportContact || undefined,
        adminPassword: formData.adminPassword,
      };

      const res = await api.post('/auth/register-university', payload);

      // Store university token (optional for later API calls from admin)
      if (res?.token) {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('auth_role', 'UNIVERSITY');
      }

      alert('🎉 Registration successful! Your university has been registered.');
      navigate('/');
    } catch (error) {
      console.error("Registration error:", error);
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
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              University Registration
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Join our parcel management platform in just a few steps
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          {/* Step Indicator */}
          <div className="bg-gradient-to-r from-[#B71C1C] via-[#C62828] to-[#D32F2F] px-4 sm:px-6 lg:px-8 py-6">
            <StepIndicator step={step} />
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 lg:p-10 bg-white">
            {step === 1 && (
              <Step1UniversityDetails 
                formData={formData} 
                setFormData={setFormData}
                errors={showErrors ? errors : {}}
              />
            )}

            {step === 2 && (
              <Step2AddressInformation 
                formData={formData} 
                setFormData={setFormData}
                errors={showErrors ? errors : {}}
              />
            )}

            {step === 3 && (
              <Step3AdminDetails 
                formData={formData} 
                setFormData={setFormData}
                errors={showErrors ? errors : {}}
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
                ) : (
                  <div></div>
                )}

                {step < 3 ? (
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
                    ) : (
                      <>
                        Create University Account
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Already have an account link */}
              <div className="text-center text-xs sm:text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/university-login')}
                  className="text-[#C62828] hover:underline"
                >
                  Sign in
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Progress Text */}
        <div className="mt-6 text-center">
          <p className="text-sm font-medium text-gray-500">
            Step {step} of 3 - {step === 3 ? '100' : Math.round((step / 3) * 100)}% Complete
          </p>
        </div>
      </div>
    </div>
  );
}
