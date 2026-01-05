export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\d\s\-+()]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateZipCode = (zipCode, country = 'US') => {
  const zipRegex = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
    GB: /^[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}$/i,
  };
  
  return zipRegex[country] ? zipRegex[country].test(zipCode) : zipCode.length > 3;
};

export const validateStep1 = (data) => {
  const errors = {};
  
  if (!data.universityName?.trim()) {
    errors.universityName = 'University name is required';
  } else if (data.universityName.length < 3 || data.universityName.length > 150) {
    errors.universityName = 'University name must be between 3 and 150 characters';
  }
  
  if (!data.institutionType?.trim()) {
    errors.institutionType = 'Institution type is required';
  }
  
  if (data.website && !validateURL(data.website)) {
    errors.website = 'Please enter a valid URL';
  }
  
  return errors;
};

export const validateStep2 = (data) => {
  const errors = {};
  
  if (!data.addressLine1?.trim()) {
    errors.addressLine1 = 'Address line 1 is required';
  }
  
  if (!data.city?.trim()) {
    errors.city = 'City is required';
  }
  
  if (!data.state?.trim()) {
    errors.state = 'State is required';
  }
  
  if (!data.country?.trim()) {
    errors.country = 'Country is required';
  }
  
  if (!data.zipCode?.trim()) {
    errors.zipCode = 'ZIP/Postal code is required';
  } else if (!validateZipCode(data.zipCode, data.country)) {
    errors.zipCode = 'Please enter a valid ZIP/Postal code';
  }
  
  return errors;
};

export const validateStep3 = (data) => {
  const errors = {};
  
  if (!data.adminName?.trim()) {
    errors.adminName = 'Administrator name is required';
  } else if (data.adminName.length < 2 || data.adminName.length > 80) {
    errors.adminName = 'Administrator name must be between 2 and 80 characters';
  }
  
  if (!data.adminPosition?.trim()) {
    errors.adminPosition = 'Administrator position is required';
  }
  
  if (!data.adminEmail?.trim()) {
    errors.adminEmail = 'Official institutional email is required';
  } else if (!validateEmail(data.adminEmail)) {
    errors.adminEmail = 'Please enter a valid email';
  }
  
  if (!data.contactNumber?.trim()) {
    errors.contactNumber = 'Contact number is required';
  } else if (!validatePhone(data.contactNumber)) {
    errors.contactNumber = 'Please enter a valid phone number in E.164 format';
  }
  
  if (!data.adminPassword?.trim()) {
    errors.adminPassword = 'Password is required';
  } else if (data.adminPassword.length < 10) {
    errors.adminPassword = 'Password must be at least 10 characters';
  } else if (!/[A-Z]/.test(data.adminPassword)) {
    errors.adminPassword = 'Password must contain at least 1 uppercase letter';
  } else if (!/[a-z]/.test(data.adminPassword)) {
    errors.adminPassword = 'Password must contain at least 1 lowercase letter';
  } else if (!/\d/.test(data.adminPassword)) {
    errors.adminPassword = 'Password must contain at least 1 digit';
  } else if (!/[^a-zA-Z\d]/.test(data.adminPassword)) {
    errors.adminPassword = 'Password must contain at least 1 special character';
  }
  
  if (!data.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and privacy policy';
  }
  
  return errors;
};

// =====================
// Individual (Student) Registration Validation
// Steps:
// 1. Personal Details (firstName, lastName, email, password, phoneNumber optional)
// 2. University & Identification (universityId, studentId, userType)
// 3. Address / Housing (dormitory, roomNumber, addressLine1, city, state, zipCode optional but validated if present)
// =====================

export const validateStudentStep1 = (data) => {
  const errors = {};

  if (!data.firstName?.trim()) {
    errors.firstName = 'First name is required';
  } else if (data.firstName.length < 2 || data.firstName.length > 80) {
    errors.firstName = 'First name must be between 2 and 80 characters';
  }

  if (!data.lastName?.trim()) {
    errors.lastName = 'Last name is required';
  } else if (data.lastName.length < 2 || data.lastName.length > 80) {
    errors.lastName = 'Last name must be between 2 and 80 characters';
  }

  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Enter a valid email';
  }

  if (!data.password?.trim()) {
    errors.password = 'Password is required';
  } else if (data.password.length < 10) {
    errors.password = 'Password must be at least 10 characters';
  } else if (!/[A-Z]/.test(data.password)) {
    errors.password = 'Include at least 1 uppercase letter';
  } else if (!/[a-z]/.test(data.password)) {
    errors.password = 'Include at least 1 lowercase letter';
  } else if (!/\d/.test(data.password)) {
    errors.password = 'Include at least 1 digit';
  } else if (!/[^a-zA-Z\d]/.test(data.password)) {
    errors.password = 'Include at least 1 special character';
  }

  if (data.phoneNumber && !validatePhone(data.phoneNumber)) {
    errors.phoneNumber = 'Enter a valid phone number';
  }

  // Gender required (MALE, FEMALE, OTHER)
  if (!data.gender) {
    errors.gender = 'Select a gender';
  } else if (!['MALE','FEMALE','OTHER'].includes(data.gender)) {
    errors.gender = 'Invalid gender';
  }

  // User type validation removed from step 1 (selection eliminated). It defaults or is preselected externally.

  return errors;
};

export const validateStudentStep2 = (data) => {
  const errors = {};

  if (!data.universityId?.trim()) {
    errors.universityId = 'Select a university';
  }

  // userType already validated in step 1; no need to revalidate here

  // Require studentId for STUDENT userType
  if (data.userType === 'STUDENT') {
    if (!data.studentId?.trim()) {
      errors.studentId = 'Student ID is required';
    } else if (data.studentId.length < 2) {
      errors.studentId = 'Student ID must be at least 2 characters';
    }
    
    if (!data.program?.trim()) {
      errors.program = 'Program is required';
    } else if (data.program.length < 2) {
      errors.program = 'Program name must be at least 2 characters';
    }
  }

  // Employee ID required for staff roles
  if (['FACULTY','STAFF','ADMIN','WARDEN'].includes(data.userType)) {
    if (!data.employeeId?.trim()) {
      errors.employeeId = 'Employee ID is required';
    }
  }

  return errors;
};
