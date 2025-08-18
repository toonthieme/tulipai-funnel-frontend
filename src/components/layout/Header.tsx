
import React from 'react';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import { Step, STEP_DESCRIPTIONS } from '../../types';

interface HeaderProps {
  totalSteps: number;
  onHomeClick: () => void;
  isAdminView: boolean;
  onLogout: () => void;
  isAuthenticated: boolean;
  currentStepEnum: Step;
}

const ProgressStepper: React.FC<{ currentStep: Step }> = ({ currentStep }) => {
    const steps = Object.keys(STEP_DESCRIPTIONS)
        .map(Number)
        .filter(s => s >= Step.BusinessInfo && s <= Step.Summary) as Step[];

    return (
        <div className="w-full">
            <ol className="flex items-center w-full">
                {steps.map((step, index) => {
                    const isCompleted = currentStep > step;
                    const isCurrent = currentStep === step;
                    const stepInfo = STEP_DESCRIPTIONS[step];

                    return (
                        <li key={step} className={`flex w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-px after:border-b after:border-1 after:inline-block" : "" } ${isCompleted ? "after:border-purple-500" : "after:border-gray-600"}`}>
                            <div className="flex flex-col items-center justify-center relative">
                                <div
                                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                                    isCurrent ? 'bg-purple-600 ring-4 ring-purple-500/30' : isCompleted ? 'bg-purple-500' : 'bg-gray-700'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <span className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-gray-400'}`}>
                                            {index + 1}
                                        </span>
                                    )}
                                </div>
                                <span 
                                    className={`absolute top-10 text-xs text-center w-24 transition-colors duration-300 ${isCurrent ? 'text-white font-medium' : 'text-gray-400 font-light'}`}
                                >
                                    {stepInfo.title}
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ onHomeClick, isAdminView, onLogout, isAuthenticated, currentStepEnum }) => {
  return (
    <header className="sticky top-0 z-50 glassmorphism">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <button 
            onClick={onHomeClick} 
            className="flex items-center text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 rounded-md"
            aria-label="Go to homepage"
          >
            <Logo />
          </button>
          <div className="flex-grow flex items-center justify-center px-8">
            {!isAdminView && currentStepEnum <= Step.Summary && (
              <ProgressStepper currentStep={currentStepEnum} />
            )}
            {isAdminView && <h1 className="text-xl font-light tracking-wider text-white">Admin Dashboard</h1>}
          </div>
          <div className="w-32 flex justify-end">
             {isAdminView && isAuthenticated && (
                <Button onClick={onLogout} size="normal" variant="secondary">
                Logout
                </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;