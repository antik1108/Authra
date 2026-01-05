import React from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { countries, states } from "../../utils/countries";

export default function Step2AddressInformation({ formData, setFormData, errors = {} }) {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const availableStates = formData.country === 'US' ? states.US : [];

  return (
    <div className="space-y-5">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Let's get you started</h2>
        <p className="text-sm text-gray-600">Enter the details to get started</p>
      </div>

      <Input
        label="Address Line 1"
        required
        value={formData.addressLine1 || ''}
        onChange={(e) => handleChange('addressLine1', e.target.value)}
        placeholder="Street address, P.O. box"
        error={errors.addressLine1}
      />

      <Input
        label="Address Line 2"
        value={formData.addressLine2 || ''}
        onChange={(e) => handleChange('addressLine2', e.target.value)}
        placeholder="Apartment, suite, unit, building, floor, etc."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <Input
          label="City"
          required
          value={formData.city || ''}
          onChange={(e) => handleChange('city', e.target.value)}
          placeholder="City"
          error={errors.city}
        />

        {formData.country === 'US' && availableStates.length > 0 ? (
          <Select
            label="State"
            required
            value={formData.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            options={availableStates}
            placeholder="Select State"
            error={errors.state}
          />
        ) : (
          <Input
            label="State/Province"
            required
            value={formData.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="State/Province"
            error={errors.state}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <Select
          label="Country"
          required
          value={formData.country || ''}
          onChange={(e) => handleChange('country', e.target.value)}
          options={countries}
          placeholder="Select Country"
          error={errors.country}
        />

        <Input
          label="ZIP / Postal Code"
          required
          value={formData.zipCode || ''}
          onChange={(e) => handleChange('zipCode', e.target.value)}
          placeholder="ZIP or Postal Code"
          error={errors.zipCode}
        />
      </div>
    </div>
  );
}
