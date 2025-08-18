
import React, { useState, useRef, useEffect, useId } from 'react';

interface MultiSelectComboboxProps {
  label: string;
  options: string[];
  selectedOptions: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

const MultiSelectCombobox: React.FC<MultiSelectComboboxProps> = ({ label, options, selectedOptions, onChange, placeholder }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = query === ''
    ? options.filter(opt => !selectedOptions.includes(opt))
    : options.filter(option =>
        !selectedOptions.includes(option) &&
        option.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, ''))
      );

  const addOption = (option: string) => {
    if (option && !selectedOptions.includes(option)) {
      onChange([...selectedOptions, option]);
    }
    setQuery('');
  };

  const removeOption = (option: string) => {
    onChange(selectedOptions.filter(item => item !== option));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query) {
      e.preventDefault();
      addOption(query);
    }
  };

  return (
    <div ref={comboboxRef}>
      <label htmlFor={inputId} className="block text-sm font-medium tracking-widest uppercase text-gray-400 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="block w-full bg-black/20 border border-gray-600 rounded-md text-white focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-colors duration-200 font-light p-2 flex flex-wrap gap-2 items-center">
            {selectedOptions.map(option => (
                <span key={option} className="flex items-center gap-x-1 bg-purple-600/50 text-white text-sm font-medium px-2 py-1 rounded-full">
                    {option}
                    <button
                        type="button"
                        onClick={() => removeOption(option)}
                        className="flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-purple-200 hover:bg-purple-500 hover:text-white focus:outline-none focus:bg-purple-500 focus:text-white"
                    >
                        <span className="sr-only">Remove {option}</span>
                        <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                        </svg>
                    </button>
                </span>
            ))}
            <input
              id={inputId}
              ref={inputRef}
              type="text"
              className="flex-grow bg-transparent border-none outline-none p-1 text-white placeholder-gray-500"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              role="combobox"
              aria-expanded={isOpen}
              aria-controls={`${inputId}-listbox`}
            />
        </div>
      </div>

      {isOpen && (
        <ul
          id={`${inputId}-listbox`}
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <li
                key={option}
                className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-300 hover:bg-purple-600/50 hover:text-white"
                onClick={() => {
                  addOption(option);
                  setIsOpen(false);
                }}
              >
                <span className="block truncate">{option}</span>
              </li>
            ))
          ) : query ? (
            <li 
              className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-300 hover:bg-purple-600/50 hover:text-white"
              onClick={() => {
                  addOption(query);
                  setIsOpen(false);
              }}
            >
              Add "<span className="font-bold">{query}</span>"
            </li>
          ) : (
             <li className="relative cursor-default select-none py-2 px-4 text-gray-500">
              Type to search or add a new industry.
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default MultiSelectCombobox;
