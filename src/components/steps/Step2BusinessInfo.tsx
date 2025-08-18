
import React from 'react';
import { FormData, TeamSize, FormErrors } from '../../types';
import { TEAM_SIZE_OPTIONS } from '../../constants';
import Input from '../ui/Input';
import RadioCard from '../ui/RadioCard';

interface Step2Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  errors: FormErrors;
}

const Step2BusinessInfo: React.FC<Step2Props> = ({ formData, updateFormData, errors }) => {
  const teamSizeOptions = [...new Set([...TEAM_SIZE_OPTIONS, formData.teamSize])];

  return (
    <div className="glassmorphism rounded-xl p-8">
      <h2 className="text-4xl font-light mb-2">About Your Business</h2>
      <p className="text-gray-400 mb-8 font-light">Let's start with the basics. This information will help us understand the context of your company.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Input label="Your Name" id="name" type="text" value={formData.name} onChange={e => updateFormData({ name: e.target.value })} error={errors.name} />
        <Input label="Work Email" id="email" type="email" value={formData.email} onChange={e => updateFormData({ email: e.target.value })} error={errors.email} />
        <Input label="Phone Number" id="phone" type="tel" value={formData.phone} onChange={e => updateFormData({ phone: e.target.value })} error={errors.phone} />
        <Input label="Your Role" id="role" type="text" value={formData.role} onChange={e => updateFormData({ role: e.target.value })} error={errors.role} />
        <Input label="Company Name" id="companyName" type="text" value={formData.companyName} onChange={e => updateFormData({ companyName: e.target.value })} error={errors.companyName} />
        <Input label="Company Website" id="website" type="url" value={formData.website} onChange={e => updateFormData({ website: e.target.value })} placeholder="https://example.com" error={errors.website} />
      </div>

      <div>
        <h3 className="block text-sm font-medium tracking-widest uppercase text-gray-400 mb-2 mt-4">Team Size</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {teamSizeOptions.map(size => (
            <RadioCard
              key={size}
              name="teamSize"
              value={size}
              label={size}
              selectedValue={formData.teamSize}
              onChange={(value) => updateFormData({ teamSize: value })}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step2BusinessInfo;
