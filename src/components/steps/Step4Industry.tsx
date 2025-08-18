
import React from 'react';
import { FormData, Industry } from '../../types';
import { INDUSTRY_OPTIONS } from '../../constants';
import MultiSelectCombobox from '../ui/MultiSelectCombobox';

interface Step4Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const Step4Industry: React.FC<Step4Props> = ({ formData, updateFormData }) => {
  const handleIndustriesChange = (industries: Industry[]) => {
    updateFormData({ industries: industries });
  };

  return (
    <div className="glassmorphism rounded-xl p-8">
      <h2 className="text-4xl font-light mb-2">Your Industries</h2>
      <p className="text-gray-400 mb-8 font-light">Select your primary industries. You can select multiple, and add custom ones if needed. This helps us tailor use cases and solutions specific to your field.</p>
      
      <MultiSelectCombobox
        label="Industries"
        options={INDUSTRY_OPTIONS}
        selectedOptions={formData.industries}
        onChange={handleIndustriesChange}
        placeholder="Search or add an industry..."
      />
    </div>
  );
};

export default Step4Industry;