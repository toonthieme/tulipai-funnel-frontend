
import React from 'react';
import { FormData, DepartmentLevel, BusinessDomain } from '../../types';
import { DEPARTMENT_LEVEL_OPTIONS, BUSINESS_DOMAIN_OPTIONS } from '../../constants';
import RadioCard from '../ui/RadioCard';
import CheckboxCard from '../ui/CheckboxCard';
import Input from '../ui/Input';

interface StepDepartmentDomainProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const StepDepartmentDomain: React.FC<StepDepartmentDomainProps> = ({ formData, updateFormData }) => {

  const handleDomainChange = (domain: BusinessDomain) => {
    const newDomains = formData.businessDomains.includes(domain)
      ? formData.businessDomains.filter(d => d !== domain)
      : [...formData.businessDomains, domain];
    updateFormData({ businessDomains: newDomains });
  };

  return (
    <div className="glassmorphism rounded-xl p-8">
      <h2 className="text-4xl font-light mb-2">Your Role & Focus</h2>
      <p className="text-gray-400 mb-8 font-light">Help us understand your position and the areas of the business you focus on.</p>
      
      <div className="mb-8">
        <h3 className="block text-sm font-medium tracking-widest uppercase text-gray-400 mb-2">Department Level</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DEPARTMENT_LEVEL_OPTIONS.map(option => (
            <RadioCard
              key={option}
              name="departmentLevel"
              value={option}
              label={option}
              selectedValue={formData.departmentLevel}
              onChange={(value) => updateFormData({ departmentLevel: value })}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="block text-sm font-medium tracking-widest uppercase text-gray-400 mb-2">Business Domain</h3>
        <p className="text-gray-400 mb-4 font-light text-sm">Select all that apply.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BUSINESS_DOMAIN_OPTIONS.map(domain => (
            <CheckboxCard
              key={domain}
              value={domain}
              label={domain}
              selectedValues={formData.businessDomains}
              onChange={handleDomainChange}
            />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Input 
            label="Other Business Domain (Optional)"
            id="otherBusinessDomain"
            type="text"
            value={formData.otherBusinessDomain || ''}
            onChange={e => updateFormData({ otherBusinessDomain: e.target.value })}
            placeholder="e.g., Customer Success, R&D..."
        />
      </div>
    </div>
  );
};

export default StepDepartmentDomain;