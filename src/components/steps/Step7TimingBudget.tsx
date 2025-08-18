
import React from 'react';
import { FormData, Timeline } from '../../types';
import { TIMELINE_OPTIONS } from '../../constants';
import RadioCard from '../ui/RadioCard';
import Slider from '../ui/Slider';

interface Step7Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const Step7TimingBudget: React.FC<Step7Props> = ({ formData, updateFormData }) => {
  // Combine default options with the selected one to ensure it's always rendered, even if custom.
  const timelineOptions = [...new Set([...TIMELINE_OPTIONS, formData.timeline])];
  const budgetValue = parseInt(formData.budget.replace(/[^0-9]/g, ''), 10) || 0;

  return (
    <div className="glassmorphism rounded-xl p-8">
      <h2 className="text-4xl font-light mb-2">Timing & Budget</h2>
      <p className="text-gray-400 mb-8 font-light">Understanding your timeline and budget helps us propose a realistic and effective project scope.</p>
      
      <div className="mb-12">
        <h3 className="block text-sm font-medium tracking-widest uppercase text-gray-400 mb-2">Implementation Timeline</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {timelineOptions.map(option => (
            <RadioCard
              key={option}
              name="timeline"
              value={option}
              label={option}
              selectedValue={formData.timeline}
              onChange={(value) => updateFormData({ timeline: value })}
            />
          ))}
        </div>
      </div>

      <div>
        <Slider
          label="Estimated Budget"
          value={budgetValue}
          onChange={(value) => updateFormData({ budget: value.toString() })}
          min={0}
          max={250000}
          step={1000}
        />
      </div>
    </div>
  );
};

export default Step7TimingBudget;