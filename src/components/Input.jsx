import React from 'react';

const Input = ({ label, type = 'text', id, placeholder, className = '', ...props }) => {
  return (
    <div className={`flex flex-col mb-md ${className}`}>
      {label && <label htmlFor={id} className="text-label-sm font-semibold text-on-surface-variant mb-xs">{label}</label>}
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        className="px-md py-sm border border-outline-variant rounded font-sans text-body-md text-on-surface bg-surface-container-lowest transition-colors duration-200 focus:outline-none focus:border-primary placeholder:text-outline"
        {...props}
      />
    </div>
  );
};

export default Input;
