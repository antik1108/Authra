import React, { useEffect } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';

// User type select removed from this step; kept here for reference if future dynamic display required.

export default function Step2StudentUniversity({ formData, setFormData, errors = {}, universities = [], loadingUniversities }) {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Default userType if empty
  useEffect(() => {
    if (!formData.userType) {
      handleChange('userType', 'STUDENT');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedType = formData.userType || 'STUDENT';

  return (
    <div className="space-y-5">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Academic Details</h2>
        <p className="text-sm text-gray-600">Link your account to your institution</p>
      </div>

      <Select
        label="University"
        required
        value={formData.universityId || ''}
        onChange={(e) => handleChange('universityId', e.target.value)}
        options={universities.map(u => ({ value: u.id, label: u.universityName || u.name || u.displayName }))}
        placeholder={loadingUniversities ? 'Loading universities…' : universities.length ? 'Select university' : 'No universities available'}
        disabled={loadingUniversities || universities.length === 0}
        error={errors.universityId}
      />
      {loadingUniversities && <p className="text-xs text-gray-500">Fetching university list...</p>}
      {!loadingUniversities && universities.length === 0 && <p className="text-xs text-amber-600">No universities registered yet.</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
        <div className="px-4 py-3.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium">
          {formData.userType}
        </div>
  <p className="text-xs text-gray-500 mt-1">User type already chosen on the first step.</p>
      </div>

      {selectedType === 'STUDENT' && (
        <>
          <Input
            label="Enrollment Number / Student ID"
            required
            value={formData.studentId || ''}
            onChange={(e) => handleChange('studentId', e.target.value)}
            placeholder="e.g., 2401010084"
            error={errors.studentId}
          />
          <Input
            label="Program"
            required
            value={formData.program || ''}
            onChange={(e) => handleChange('program', e.target.value)}
            placeholder="e.g., B. Tech (Computer Science)"
            error={errors.program}
          />
        </>
      )}

      {['FACULTY','STAFF','ADMIN','WARDEN'].includes(selectedType) && (
        <>
          <Input
            label="Employee ID"
            required
            value={formData.employeeId || ''}
            onChange={(e) => handleChange('employeeId', e.target.value)}
            placeholder="e.g., E98765"
            error={errors.employeeId}
          />
          {selectedType === 'STAFF' && (
            <Input
              label="Department"
              value={formData.department || ''}
              onChange={(e) => handleChange('department', e.target.value)}
              placeholder="e.g., Computer Science Department"
              error={errors.department}
            />
          )}
          {selectedType === 'ADMIN' && (
            <Input
              label="Position"
              value={formData.position || ''}
              onChange={(e) => handleChange('position', e.target.value)}
              placeholder="e.g., Registrar"
              error={errors.position}
            />
          )}
          {selectedType === 'WARDEN' && (
            <Input
              label="Hostel Name"
              value={formData.hostelName || ''}
              onChange={(e) => handleChange('hostelName', e.target.value)}
              placeholder="e.g., North Hostel Block A"
              error={errors.hostelName}
            />
          )}
          {selectedType === 'FACULTY' && (
            <Input
              label="Department / Program"
              value={formData.program || ''}
              onChange={(e) => handleChange('program', e.target.value)}
              placeholder="e.g., Computer Science Department"
              error={errors.program}
            />
          )}
        </>
      )}
    </div>
  );
}
