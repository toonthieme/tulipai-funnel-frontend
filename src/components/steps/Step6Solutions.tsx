
import React from 'react';
import { FormData, Solution } from '../../types';
import { SOLUTION_OPTIONS } from '../../constants';
import CheckboxCard from '../ui/CheckboxCard';

interface Step6Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const Step6Solutions: React.FC<Step6Props> = ({ formData, updateFormData }) => {
  const handleSolutionChange = (solution: Solution) => {
    const newSolutions = formData.solutions.includes(solution)
      ? formData.solutions.filter(s => s !== solution)
      : [...formData.solutions, solution];
    updateFormData({ solutions: newSolutions });
  };

  // Combine default options with selected ones to ensure custom options are rendered.
  const allSolutionOptions = [...new Set([...SOLUTION_OPTIONS, ...formData.solutions])];

  return (
    <div className="glassmorphism rounded-xl p-8">
      <h2 className="text-4xl font-light mb-2">Potential AI Solutions</h2>
      <p className="text-gray-400 mb-8 font-light">Based on your challenges, here are some solutions that might be a good fit. Select any that interest you.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allSolutionOptions.map(solution => (
          <CheckboxCard
            key={solution}
            value={solution}
            label={solution}
            selectedValues={formData.solutions}
            onChange={handleSolutionChange}
          />
        ))}
      </div>
    </div>
  );
};

export default Step6Solutions;