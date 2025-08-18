
import React from 'react';

interface CheckboxCardProps<T extends string> {
  value: T;
  label: string;
  selectedValues: T[];
  onChange: (value: T) => void;
}

const CheckboxCard = <T extends string,>({ value, label, selectedValues, onChange }: CheckboxCardProps<T>) => {
  const isSelected = selectedValues.includes(value);
  return (
    <label className={`block cursor-pointer rounded-lg border p-4 transition-all duration-200 ${isSelected ? 'bg-purple-600/30 border-purple-500 ring-2 ring-purple-500' : 'bg-black/20 border-gray-600 hover:border-gray-400'}`}>
      <input
        type="checkbox"
        value={value}
        checked={isSelected}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span className={`font-light text-base ${isSelected ? 'text-white' : 'text-gray-300'}`}>{label}</span>
    </label>
  );
};

export default CheckboxCard;
