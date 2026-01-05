import React from 'react';

export default function Textarea({ 
  label, 
  error, 
  required = false,
  rows = 4,
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
      <textarea
        rows={rows}
        className={`
          w-full px-3 py-2.5 text-sm border-2 rounded-lg
          focus:outline-none focus:border-[#C62828] focus:ring-0
          transition-all duration-200 resize-none
          placeholder:text-gray-400
          ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 hover:border-gray-400'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
