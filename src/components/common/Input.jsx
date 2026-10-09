import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(({
  label,
  error,
  hint,
  icon: Icon,
  iconPosition = 'left',
  rightElement,
  className = '',
  containerClassName = '',
  required = false,
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon className="w-4 h-4 text-neutral-400" />
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`input ${error ? 'input-error' : ''} ${Icon && iconPosition === 'left' ? 'pl-10' : ''} ${rightElement || (Icon && iconPosition === 'right') ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {Icon && iconPosition === 'right' && !rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Icon className="w-4 h-4 text-neutral-400" />
          </div>
        )}
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}
      {hint && !error && (
        <p className="text-xs text-neutral-500">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
