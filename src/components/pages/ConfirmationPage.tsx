
import React, { useState, useEffect } from 'react';
import { FormData } from '../../types';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

interface ConfirmationProps {
  formData: FormData;
  onHomeClick: () => void;
}

const ConfirmationPage: React.FC<ConfirmationProps> = ({ formData, onHomeClick }) => {
  const [emailStatus, setEmailStatus] = useState<'sending' | 'sent'>('sending');

  useEffect(() => {
    const timer = setTimeout(() => {
      setEmailStatus('sent');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto text-center glassmorphism rounded-xl p-8 md:p-12 z-10 animate-fade-in">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-600 mb-6">
        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-5xl md:text-6xl font-extralight text-white mb-4">
        Thank you for your payment
      </h1>
      <p className="max-w-2xl mx-auto text-lg text-gray-300 font-light">
        We have received your request, {formData.name}. Our team will review your submission and prepare your personalized AI proposal.
      </p>

      <div className="mt-8 bg-black/20 border border-gray-700 rounded-lg p-4 flex items-center justify-center gap-3 transition-all duration-300">
          {emailStatus === 'sending' ? (
              <>
                  <Spinner />
                  <p className="text-gray-300 font-light animate-pulse">Sending confirmation email to {formData.email}...</p>
              </>
          ) : (
              <>
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-200 font-light">Confirmation email sent to <strong className="font-medium text-purple-300">{formData.email}</strong>.</p>
              </>
          )}
      </div>
      
      <div className="mt-10 flex items-center justify-center gap-4">
        <Button onClick={onHomeClick} variant="secondary">
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationPage;
