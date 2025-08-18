
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, ...props }) => {
  const hasError = !!error;
  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-sm font-medium tracking-widest uppercase text-gray-400 mb-2">
        {label}
      </label>
      <input
        id={id}
        name={id} // Ensure name attribute matches id for validation handling
        className={`block w-full bg-black/20 border rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 font-light ${
          hasError 
          ? 'border-red-500 ring-red-500' 
          : 'border-gray-600 focus:ring-purple-500 focus:border-purple-500'
        }`}
        {...props}
      />
      {hasError && <p className="mt-2 text-sm text-red-400 animate-fade-in">{error}</p>}
    </div>
  );
};

export default Input;
