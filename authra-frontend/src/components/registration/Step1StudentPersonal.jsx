import React, { useState } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Eye, EyeOff } from 'lucide-react';

export default function Step1StudentPersonal({ formData, setFormData, errors = {} }) {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const getPasswordStrength = () => {
    const password = formData.password || '';
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
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
        <p className="text-sm text-gray-600">Enter your personal details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <Input
            label="First Name"
            required
            value={formData.firstName || ''}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="Jane"
            error={errors.firstName}
          />
          <p className="text-xs text-gray-500 mt-1">2-80 characters</p>
        </div>
        <div>
          <Input
            label="Last Name"
            required
            value={formData.lastName || ''}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Doe"
            error={errors.lastName}
          />
          <p className="text-xs text-gray-500 mt-1">2-80 characters</p>
        </div>
      </div>

      <Select
        label="Gender"
        required
        value={formData.gender || ''}
        onChange={(e) => handleChange('gender', e.target.value)}
        options={[
          { value: 'MALE', label: 'Male' },
          { value: 'FEMALE', label: 'Female' },
          { value: 'OTHER', label: 'Other' }
        ]}
        placeholder="Select gender"
        error={errors.gender}
      />

      <Input
        label="Email"
        type="email"
        required
        value={formData.email || ''}
        onChange={(e) => handleChange('email', e.target.value)}
        placeholder="you@example.edu"
        error={errors.email}
      />


      <Input
        label="Phone Number (optional)"
        type="tel"
        value={formData.phoneNumber || ''}
        onChange={(e) => handleChange('phoneNumber', e.target.value)}
        placeholder="+1 555 123 4567"
        error={errors.phoneNumber}
      />

      <div className="relative">
        <Input
          label="Password"
          required
          type={showPassword ? 'text' : 'password'}
          value={formData.password || ''}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="Enter a strong password"
          error={errors.password}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
        {formData.password && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(bar => (
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
                />
              ))}
            </div>
            <div className="text-xs space-y-0.5">
              <p className={`${formData.password.length >= 10 ? 'text-green-600' : 'text-gray-600'}`}>{formData.password.length >= 10 ? '✓' : '○'} At least 10 characters</p>
              <p className={`${/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}`}>{/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? '✓' : '○'} Upper + lower case</p>
              <p className={`${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}`}>{/\d/.test(formData.password) ? '✓' : '○'} Number</p>
              <p className={`${/[^a-zA-Z\d]/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}`}>{/[^a-zA-Z\d]/.test(formData.password) ? '✓' : '○'} Special character</p>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">At least 10 chars, with upper, lower, digit, special</p>
        {/* User type selection removed per requirement; type now determined before wizard or defaults to STUDENT. */}
      </div>
    </div>
  );
}
