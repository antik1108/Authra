import React from 'react';

export default function Select({ 
  label, 
  error, 
  required = false,
  options = [],
  placeholder = 'Select an option',
  className = '',
  ...props 
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`
          w-full px-3 py-2.5 text-sm border-2 rounded-lg
          focus:outline-none focus:border-[#C62828] focus:ring-0
          transition-all duration-200 bg-white
          ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 hover:border-gray-400'}
          ${className}
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
