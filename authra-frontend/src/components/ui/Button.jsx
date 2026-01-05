import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props 
}) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm';
  
  const variants = {
    primary: 'bg-[#C62828] text-white hover:bg-[#B71C1C] hover:shadow-md active:scale-95',
    secondary: 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300',
    outline: 'border-2 border-[#C62828] text-[#C62828] hover:bg-[#C62828] hover:text-white',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
