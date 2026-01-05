import React from 'react';
import Input from '../ui/Input';

export default function Step3StudentAddress({ formData, setFormData, errors = {} }) {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-5">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Address (Optional)</h2>
        <p className="text-sm text-gray-600">Add address details for deliveries or identification</p>
      </div>

      <Input
        label="Address Line 1"
        value={formData.addressLine1 || ''}
        onChange={(e) => handleChange('addressLine1', e.target.value)}
        placeholder="Street address"
        error={errors.addressLine1}
      />

      <Input
        label="Address Line 2"
        value={formData.addressLine2 || ''}
        onChange={(e) => handleChange('addressLine2', e.target.value)}
        placeholder="Apartment, suite, unit, etc"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <Input
          label="City"
          value={formData.city || ''}
          onChange={(e) => handleChange('city', e.target.value)}
          placeholder="City"
          error={errors.city}
        />
        <Input
          label="State / Province"
          value={formData.state || ''}
          onChange={(e) => handleChange('state', e.target.value)}
          placeholder="State"
          error={errors.state}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <Input
          label="ZIP / Postal Code"
          value={formData.zipCode || ''}
          onChange={(e) => handleChange('zipCode', e.target.value)}
          placeholder="ZIP / Postal Code"
          error={errors.zipCode}
        />
        <Input
          label="Country (optional)"
          value={formData.country || ''}
          onChange={(e) => handleChange('country', e.target.value)}
          placeholder="Country"
        />
      </div>
    </div>
  );
}
