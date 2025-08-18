
import React from 'react';
import Button from './Button';

interface ResumeBannerProps {
  onResume: () => void;
  onStartNew: () => void;
}

const ResumeBanner: React.FC<ResumeBannerProps> = ({ onResume, onStartNew }) => {
  return (
    <div className="w-full max-w-4xl mx-auto glassmorphism rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-down">
      <div className="flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-white font-light">
          It looks like you have a session in progress.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button onClick={onStartNew} variant="secondary">
          Start New
        </Button>
        <Button onClick={onResume}>
          Resume
        </Button>
      </div>
    </div>
  );
};

export default ResumeBanner;
