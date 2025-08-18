import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'normal' | 'large';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'normal', className, ...props }) => {
  const baseStyles = 'rounded-lg font-medium tracking-wider transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5';

  const sizes = {
    normal: 'px-8 py-3 text-base',
    large: 'px-10 py-4 text-lg',
  };

  const variants = {
    primary: 'bg-purple-600 text-white hover:bg-purple-500 focus:ring-purple-500',
    secondary: 'bg-gray-700/50 text-gray-200 hover:bg-gray-600/70 focus:ring-gray-500',
  };

  return (
    <button className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className || ''}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
