import React, { useState } from "react";
import Input from "../ui/Input";
import { Eye, EyeOff } from "lucide-react";

export default function Step3AdminDetails({ formData, setFormData, errors = {} }) {
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Calculate password strength score (0-5)
  const getPasswordStrength = () => {
    const password = formData.adminPassword || '';
    let strength = 0;
    
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    return strength;
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="space-y-5">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Let's get you started</h2>
        <p className="text-sm text-gray-600">Enter the details to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <Input
            label="Administrator Name"
            required
            value={formData.adminName || ''}
            onChange={(e) => handleChange('adminName', e.target.value)}
            placeholder="John Doe"
            error={errors.adminName}
          />
          <p className="text-xs text-gray-500 mt-1">2-80 characters</p>
        </div>

        <Input
          label="Administrator Position"
          required
          value={formData.adminPosition || ''}
          onChange={(e) => handleChange('adminPosition', e.target.value)}
          placeholder="Registrar"
          error={errors.adminPosition}
        />
      </div>

      <div>
        <Input
          label="Official Institutional Email"
          required
          type="email"
          value={formData.adminEmail || ''}
          onChange={(e) => handleChange('adminEmail', e.target.value)}
          placeholder="admin@university.edu"
          error={errors.adminEmail}
        />
        <p className="text-xs text-gray-500 mt-1">Use an official institutional email like admin@university.edu</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <Input
            label="Contact Number"
            required
            type="tel"
            value={formData.contactNumber || ''}
            onChange={(e) => handleChange('contactNumber', e.target.value)}
            placeholder="+911234567890"
            error={errors.contactNumber}
          />
          <p className="text-xs text-gray-500 mt-1">E.164 format (e.g., +911234567890)</p>
        </div>

        <Input
          label="Support Contact"
          type="email"
          value={formData.supportContact || ''}
          onChange={(e) => handleChange('supportContact', e.target.value)}
          placeholder="support@university.edu"
          error={errors.supportContact}
        />
      </div>

      <div className="relative">
        <Input
          label="Password"
          required
          type={showPassword ? 'text' : 'password'}
          value={formData.adminPassword || ''}
          onChange={(e) => handleChange('adminPassword', e.target.value)}
          placeholder="Enter a strong password"
          error={errors.adminPassword}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
        
        {formData.adminPassword && (
          <div className="mt-2 space-y-1">
            {/* Password strength bars - fill from left to right based on strength */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((bar) => (
                <div
                  key={bar}
                  className={`h-1 flex-1 rounded transition-all duration-300 ${
                    passwordStrength >= bar
                      ? passwordStrength === 5
                        ? 'bg-green-500'
                        : passwordStrength >= 3
                        ? 'bg-yellow-500'
                        : 'bg-orange-500'
                      : 'bg-gray-300'
                  }`}
                ></div>
              ))}
            </div>
            
            {/* Password requirement text with dynamic messages */}
            <div className="text-xs space-y-0.5">
              <p className={`${formData.adminPassword.length >= 10 ? 'text-green-600' : 'text-gray-600'}`}>
                {formData.adminPassword.length >= 10 ? '✓' : '○'} At least 10 characters
              </p>
              <p className={`${/[A-Z]/.test(formData.adminPassword) && /[a-z]/.test(formData.adminPassword) ? 'text-green-600' : 'text-gray-600'}`}>
                {/[A-Z]/.test(formData.adminPassword) && /[a-z]/.test(formData.adminPassword) ? '✓' : '○'} Uppercase and lowercase letters
              </p>
              <p className={`${/\d/.test(formData.adminPassword) ? 'text-green-600' : 'text-gray-600'}`}>
                {/\d/.test(formData.adminPassword) ? '✓' : '○'} Add number
              </p>
              <p className={`${/[^a-zA-Z\d]/.test(formData.adminPassword) ? 'text-green-600' : 'text-gray-600'}`}>
                {/[^a-zA-Z\d]/.test(formData.adminPassword) ? '✓' : '○'} Add special character
              </p>
            </div>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-1">
          At least 10 characters, 1 uppercase, 1 lowercase, 1 digit, 1 special character
        </p>
      </div>

      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          id="terms"
          checked={acceptTerms}
          onChange={(e) => {
            setAcceptTerms(e.target.checked);
            handleChange('acceptTerms', e.target.checked);
          }}
          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="terms" className="text-sm text-gray-700">
          I confirm I represent this institution and accept the{' '}
          <a href="#" className="text-blue-600 hover:underline">Terms</a>
          {' & '}
          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.{' '}
          <span className="text-red-500">*</span>
        </label>
      </div>

      {errors.acceptTerms && (
        <p className="text-sm text-red-500 -mt-4">{errors.acceptTerms}</p>
      )}
    </div>
  );
}
