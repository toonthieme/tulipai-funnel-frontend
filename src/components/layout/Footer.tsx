
import React from 'react';
import Button from '../ui/Button';

interface FooterProps {
  onBack: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  nextButtonText?: string;
}

const Footer: React.FC<FooterProps> = ({ onBack, onNext, isNextDisabled = false, nextButtonText = 'Next' }) => {
  return (
    <footer className="sticky bottom-0 z-50 glassmorphism mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Button onClick={onBack} variant="secondary">
            Back
          </Button>
          <Button onClick={onNext} disabled={isNextDisabled}>
            {nextButtonText}
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
