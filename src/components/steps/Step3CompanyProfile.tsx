
import React from 'react';
import { FormData } from '../../types';
import Button from '../ui/Button';
import SkeletonLoader from '../ui/SkeletonLoader';

interface Step3Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onRegenerate: () => void;
  isLoading: boolean;
}

const Step3CompanyProfile: React.FC<Step3Props> = ({ formData, updateFormData, onRegenerate, isLoading }) => {
  // The logic to automatically generate the summary is handled by a useEffect
  // in App.tsx, which triggers when this component becomes the current step.
  // This ensures the loading state is correctly handled before the API call.

  return (
    <div className="glassmorphism rounded-xl p-8">
      <h2 className="text-4xl font-light mb-2">Company Profile</h2>
      <p className="text-gray-400 mb-8 font-light transition-opacity duration-300">
        {isLoading
          ? 'Analyzing your website to create a summary...'
          : "We've generated a summary based on your website. Please review and edit if needed to ensure it's accurate."}
      </p>
      
      <div className="mb-6">
        <label htmlFor="companySummary" className="block text-sm font-medium tracking-widest uppercase text-gray-400 mb-2">
          Company Summary
        </label>
        <div className="relative min-h-[240px] flex items-center justify-center">
          <textarea
            id="companySummary"
            rows={8}
            className={`block w-full bg-black/20 border border-gray-600 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-opacity duration-300 font-light ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            value={formData.companySummary}
            onChange={e => updateFormData({ companySummary: e.target.value })}
            placeholder="Enter a brief summary of your company here..."
            disabled={isLoading}
            aria-busy={isLoading}
          />
          {isLoading && (
              <div className="absolute inset-0 flex flex-col items-start justify-start p-4 bg-black/50 rounded-md text-white transition-opacity duration-300 animate-fade-in">
                  <div className="w-full space-y-3">
                    <SkeletonLoader className="h-4 w-3/4" />
                    <SkeletonLoader className="h-4 w-full" />
                    <SkeletonLoader className="h-4 w-full" />
                    <SkeletonLoader className="h-4 w-5/6" />
                  </div>
              </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onRegenerate} variant="secondary" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Regenerate Summary'}
        </Button>
      </div>
    </div>
  );
};

export default Step3CompanyProfile;
