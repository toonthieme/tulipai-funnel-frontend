
import React from 'react';
import { FormData, Challenge } from '../../types';
import { CHALLENGE_OPTIONS } from '../../constants';
import CheckboxCard from '../ui/CheckboxCard';

interface Step5Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const Step5Challenges: React.FC<Step5Props> = ({ formData, updateFormData }) => {
  const handleChallengeChange = (challenge: Challenge) => {
    const newChallenges = formData.challenges.includes(challenge)
      ? formData.challenges.filter(c => c !== challenge)
      : [...formData.challenges, challenge];
    updateFormData({ challenges: newChallenges });
  };

  // Combine default options with selected ones to ensure custom options are rendered.
  const allChallengeOptions = [...new Set([...CHALLENGE_OPTIONS, ...formData.challenges])];

  return (
    <div className="glassmorphism rounded-xl p-8">
      <h2 className="text-4xl font-light mb-2">Business Challenges</h2>
      <p className="text-gray-400 mb-8 font-light">What are the primary pain points you're looking to solve? This is crucial for matching you with the right AI tools.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allChallengeOptions.map(challenge => (
          <CheckboxCard
            key={challenge}
            value={challenge}
            label={challenge}
            selectedValues={formData.challenges}
            onChange={handleChallengeChange}
          />
        ))}
      </div>

      <div className="mt-8">
        <label htmlFor="challengeClarification" className="block text-sm font-medium tracking-widest uppercase text-gray-400 mb-2">
          Would you like to briefly clarify your challenge? (Optional)
        </label>
        <textarea
            id="challengeClarification"
            rows={3}
            maxLength={300}
            className="block w-full bg-black/20 border border-gray-600 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 font-light"
            value={formData.challengeClarification}
            onChange={e => updateFormData({ challengeClarification: e.target.value })}
            placeholder="For example: 'Our customer support team spends too much time answering repetitive questions...'"
          />
          <p className="text-right text-xs text-gray-500 mt-1">{formData.challengeClarification.length} / 300</p>
      </div>
    </div>
  );
};

export default Step5Challenges;
