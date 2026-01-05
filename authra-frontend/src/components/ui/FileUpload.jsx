import React, { useRef, useState } from 'react';
import { Upload, X, FileIcon } from 'lucide-react';

export default function FileUpload({ 
  label, 
  error, 
  required = false,
  accept = 'image/*',
  onChange,
  value,
  className = ''
}) {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (onChange) onChange(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const handleClear = () => {
    setPreview(null);
    if (onChange) onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAcceptText = () => {
    if (accept.includes('pdf')) {
      return 'Click to upload PDF, PNG, or JPG (max 10MB)';
    }
    if (accept.includes('svg')) {
      return 'Click to upload PNG, JPG, or SVG';
    }
    return 'Click to upload or drag and drop';
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div 
        className={`
          border-2 border-dashed rounded-lg p-6 text-center
          transition-all duration-300 cursor-pointer
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-[#C62828] hover:bg-gray-50'}
          ${className}
        `}
        onClick={() => !preview && !value && fileInputRef.current?.click()}
      >
        {preview ? (
          <div className="relative inline-block">
            <img src={preview} alt="Preview" className="max-h-32 mx-auto rounded" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : value ? (
          <div className="flex items-center justify-center space-x-2">
            <FileIcon className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600">{value.name || 'File selected'}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="text-red-500 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-xs sm:text-sm text-gray-600">{getAcceptText()}</p>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
