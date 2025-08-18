
import React from 'react';
import Button from '../ui/Button';
import Logo from '../ui/Logo';

interface LandingHeaderProps {
  onAboutClick: () => void;
  onStartClick: () => void;
  onHomeClick: () => void;
  onAdminClick: () => void;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({ onAboutClick, onStartClick, onHomeClick, onAdminClick }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 animate-fade-in-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button 
            onClick={onHomeClick} 
            className="flex items-center text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 rounded-md"
            aria-label="Go to homepage"
          >
            <Logo />
          </button>
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={onAboutClick}
              className="text-gray-300 hover:text-white font-medium tracking-wide text-sm transition-colors duration-200 px-4 py-2 rounded-md hover:bg-white/10"
              aria-label="Navigate to About Us page"
            >
              About Us
            </button>
            <button 
              onClick={onAdminClick}
              className="relative text-gray-300 hover:text-white font-medium tracking-wide text-sm transition-colors duration-200 px-4 py-2 rounded-md hover:bg-white/10"
              aria-label="Navigate to Admin Dashboard"
            >
              Admin
            </button>
            <Button onClick={onStartClick} variant="primary">
                Get Started
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
