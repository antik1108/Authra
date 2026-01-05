import React from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import FileUpload from "../ui/FileUpload";

const institutionTypes = [
  { value: 'Public', label: 'Public' },
  { value: 'Private', label: 'Private' },
  { value: 'Community College', label: 'Community College' },
  { value: 'Technical Institute', label: 'Technical Institute' },
  { value: 'Research University', label: 'Research University' },
];

export default function Step1UniversityDetails({ formData, setFormData, errors = {} }) {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-5">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Let's get you started</h2>
        <p className="text-sm text-gray-600">Enter the details to get started</p>
      </div>

      <div>
        <Input
          label="University Name"
          required
          value={formData.universityName || ''}
          onChange={(e) => handleChange('universityName', e.target.value)}
          placeholder="e.g., Harvard University"
          error={errors.universityName}
        />
        <p className="text-xs text-gray-500 mt-1">3-150 characters</p>
      </div>

      <Select
        label="Institution Type"
        required
        value={formData.institutionType || ''}
        onChange={(e) => handleChange('institutionType', e.target.value)}
        options={institutionTypes}
        placeholder="Select institution type"
        error={errors.institutionType}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <Input
          label="Website URL"
          type="url"
          value={formData.website || ''}
          onChange={(e) => handleChange('website', e.target.value)}
          placeholder="https://university.edu"
          error={errors.website}
        />

        <Input
          label="Established Year"
          type="number"
          value={formData.establishedYear || ''}
          onChange={(e) => handleChange('establishedYear', e.target.value)}
          placeholder="2000"
          error={errors.establishedYear}
        />
      </div>

      <Input
        label="Number of Students"
        type="number"
        value={formData.numberOfStudents || ''}
        onChange={(e) => handleChange('numberOfStudents', e.target.value)}
        placeholder="10000"
        error={errors.numberOfStudents}
      />

      <Textarea
        label="Accreditation Information"
        value={formData.accreditationInfo || ''}
        onChange={(e) => handleChange('accreditationInfo', e.target.value)}
        placeholder="Enter accreditation details"
        rows={4}
      />

      <FileUpload
        label="Upload Logo"
        accept="image/png, image/jpeg, image/svg+xml"
        value={formData.logo}
        onChange={(file) => handleChange('logo', file)}
        error={errors.logo}
      />

      <FileUpload
        label="Upload Proof of Institution"
        accept="application/pdf, image/png, image/jpeg"
        value={formData.proofOfInstitution}
        onChange={(file) => handleChange('proofOfInstitution', file)}
        error={errors.proofOfInstitution}
      />
    </div>
  );
}
