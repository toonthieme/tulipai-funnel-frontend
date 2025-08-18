
import React, { useState, useRef, useEffect, useId } from 'react';

interface ComboboxProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const Combobox: React.FC<ComboboxProps> = ({ label, options, value, onChange, placeholder }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);
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
    ? options
    : options.filter(option =>
        option.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, ''))
      );

  const handleSelect = (option: string) => {
    onChange(option);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={comboboxRef}>
      <label htmlFor={inputId} className="block text-sm font-medium tracking-widest uppercase text-gray-400 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="text"
          className="block w-full bg-black/20 border border-gray-600 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 font-light"
          value={query || value}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value !== value) {
              onChange('');
            }
            setIsOpen(true);
          }}
          onClick={() => setIsOpen(p => !p)}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`${inputId}-listbox`}
        />
        <button type="button" onClick={() => setIsOpen(p => !p)} className="absolute inset-y-0 right-0 flex items-center pr-2">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.24a.75.75 0 011.06 0L10 15.148l2.69-2.908a.75.75 0 111.06 1.06l-3.25 3.5a.75.75 0 01-1.06 0l-3.25-3.5a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </button>
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
                className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-300 hover:bg-purple-600/50 hover:text-white"
                onClick={() => handleSelect(option)}
              >
                <span className="block truncate">{option}</span>
                {value === option && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-purple-400">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </li>
            ))
          ) : (
            <li className="relative cursor-default select-none py-2 px-4 text-gray-500">
              No options found.
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default Combobox;
