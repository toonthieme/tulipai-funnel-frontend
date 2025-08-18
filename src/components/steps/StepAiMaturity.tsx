
import React from 'react';
import { FormData, AiStage } from '../../types';
import { AI_STAGE_OPTIONS } from '../../constants';
import RadioCard from '../ui/RadioCard';

interface StepAiMaturityProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const StepAiMaturity: React.FC<StepAiMaturityProps> = ({ formData, updateFormData }) => {
  // Combine default options with the selected one to ensure it's always rendered, even if custom.
  const allStageOptions = [...new Set([...AI_STAGE_OPTIONS, formData.aiStage])];

  return (
    <div className="glassmorphism rounded-xl p-8">
      <h2 className="text-4xl font-light mb-2">AI Readiness</h2>
      <p className="text-gray-400 mb-8 font-light">Your experience with AI helps us understand the best starting point for our collaboration.</p>
      
      <div className="mb-8">
        <h3 className="block text-sm font-medium tracking-widest uppercase text-gray-400 mb-2">What is your current stage with AI?</h3>
        <p className="text-gray-400 mb-4 font-light text-sm">Select the option that best describes your situation.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allStageOptions.map(option => (
            <RadioCard
              key={option}
              name="aiStage"
              value={option}
              label={option}
              selectedValue={formData.aiStage}
              onChange={(value) => updateFormData({ aiStage: value })}
            />
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="aiUseCase" className="block text-sm font-medium tracking-widest uppercase text-gray-400 mb-2">
          Do you already have an AI use case in mind? (Optional)
        </label>
        <p className="text-gray-400 mb-4 font-light text-sm">Briefly describe your use case or idea.</p>
        <textarea
            id="aiUseCase"
            rows={4}
            maxLength={500}
            className="block w-full bg-black/20 border border-gray-600 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 font-light"
            value={formData.aiUseCase}
            onChange={e => updateFormData({ aiUseCase: e.target.value })}
            placeholder="For example: 'Automate customer support with a chatbot', 'Detect fraudulent transactions in real-time', 'Summarize long legal documents', 'Optimize our delivery routes'..."
          />
          <p className="text-right text-xs text-gray-500 mt-1">{formData.aiUseCase.length} / 500</p>
      </div>
    </div>
  );
};

export default StepAiMaturity;