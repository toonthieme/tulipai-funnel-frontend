
import React from 'react';

interface SliderProps {
  label: string;
  value: number; 
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const Slider: React.FC<SliderProps> = ({ label, value, onChange, min = 0, max = 250000, step = 1000 }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(event.target.value, 10));
  };
  
  const formattedValue = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value);

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-medium tracking-widest uppercase text-gray-400">{label}</label>
        <span className="px-4 py-1 text-lg font-light text-white bg-black/30 rounded-md">
          {formattedValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
        aria-label={label}
      />
    </div>
  );
};

export default Slider;