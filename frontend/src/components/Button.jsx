import React from 'react';

const Button = ({ children, variant = 'primary', type = 'button', onClick, className = '', ...props }) => {
  let variantClasses = '';
  
  if (variant === 'primary') {
    variantClasses = 'bg-tertiary-container text-on-tertiary hover:bg-tertiary';
  } else if (variant === 'secondary') {
    variantClasses = 'bg-transparent text-primary border border-primary hover:bg-primary-container hover:text-on-primary-container';
  } else if (variant === 'ghost') {
    variantClasses = 'bg-transparent text-on-surface-variant hover:bg-surface-container';
  }

  return (
    <button 
      type={type} 
      className={`inline-flex items-center justify-center px-md py-sm rounded text-label-md uppercase cursor-pointer transition-colors duration-200 focus:outline-none ${variantClasses} ${className}`} 
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
