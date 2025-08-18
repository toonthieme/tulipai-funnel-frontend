
import React from 'react';

interface RadioCardProps<T extends string> {
  name: string;
  value: T;
  label: string;
  selectedValue: T;
  onChange: (value: T) => void;
}

const RadioCard = <T extends string,>({ name, value, label, selectedValue, onChange }: RadioCardProps<T>) => {
  const isSelected = value === selectedValue;
  return (
    <label className={`block cursor-pointer rounded-lg border p-4 transition-all duration-200 ${isSelected ? 'bg-purple-600/30 border-purple-500 ring-2 ring-purple-500' : 'bg-black/20 border-gray-600 hover:border-gray-400'}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={isSelected}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span className={`font-light text-base ${isSelected ? 'text-white' : 'text-gray-300'}`}>{label}</span>
    </label>
  );
};

export default RadioCard;
