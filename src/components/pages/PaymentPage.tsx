
import React, { useState } from 'react';
import { FormData } from '../../types';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

interface PaymentPageProps {
  formData: FormData;
  onPaymentSuccess: () => void;
  onBack: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ formData, onPaymentSuccess, onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate API call to Stripe and payment processing
    setTimeout(() => {
      onPaymentSuccess();
      setIsProcessing(false);
    }, 2500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center glassmorphism rounded-xl p-8 md:p-12 z-10 animate-fade-in">
      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-purple-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
      <h1 className="text-4xl md:text-5xl font-extralight text-white mb-4">
        Final Step
      </h1>
      <p className="max-w-xl mx-auto text-lg text-gray-300 font-light">
        For <strong>€27.50</strong> <span className="text-xs text-gray-400">(excl. VAT)</span>, you’ll receive a tailored AI proposal within 3 working days. This amount is non-refundable, but will be deducted from the final price if a project is initiated.
      </p>

      {isProcessing && (
         <div className="mt-8 bg-black/20 border border-gray-700 rounded-lg p-4 flex items-center justify-center gap-3 transition-all duration-300">
            <Spinner />
            <p className="text-gray-300 font-light animate-pulse">Processing payment securely...</p>
        </div>
      )}
      
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button onClick={onBack} variant="secondary" disabled={isProcessing}>
            Back to Summary
        </Button>
        <Button onClick={handlePayment} size="large" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Pay with Stripe'}
        </Button>
      </div>
       <p className="text-xs text-gray-500 mt-6">
        You will be redirected to Stripe to complete your payment. This is a test environment.
      </p>
    </div>
  );
};

export default PaymentPage;
