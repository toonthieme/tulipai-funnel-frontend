
import React from 'react';
import Button from '../ui/Button';
import ResumeBanner from '../ui/ResumeBanner';

interface LandingPageProps {
  onStartClick: () => void;
  showResumeBanner: boolean;
  onResume: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartClick, showResumeBanner, onResume }) => {
  return (
    <main className="flex-grow flex flex-col items-center justify-center text-center text-white p-6">
      {showResumeBanner && <ResumeBanner onResume={onResume} onStartNew={onStartClick} />}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extralight text-white mb-8 animate-fade-in-down">
            In just a few steps, we'll generate a personalized AI proposal, tailored to your business goals.
          </h1>
        </div>
        
        <div className="max-w-xl mx-auto animate-fade-in-up mt-4">
            <ul className="space-y-4 text-lg text-gray-200 font-light">
                <li className="flex items-start text-left">
                    <svg className="w-6 h-6 mr-4 text-purple-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    <span>Understand your specific needs</span>
                </li>
                <li className="flex items-start text-left">
                    <svg className="w-6 h-6 mr-4 text-purple-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    <span>Identify high-impact AI solutions</span>
                </li>
                <li className="flex items-start text-left">
                    <svg className="w-6 h-6 mr-4 text-purple-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    <span>Receive a clear, actionable proposal</span>
                </li>
            </ul>
            <div className="mt-10">
              <Button onClick={onStartClick} size="large">
                Get Started
              </Button>
            </div>
            <p className="max-w-md mx-auto text-sm text-gray-400 font-light mt-6">
                For <strong>€27.50</strong> <span className="text-xs">(excl. VAT)</span>, you’ll receive a tailored AI proposal. This amount is non-refundable, but will be deducted from the final price if a project is initiated.
            </p>
        </div>
      </div>
    </main>
  );
};

export default LandingPage;
