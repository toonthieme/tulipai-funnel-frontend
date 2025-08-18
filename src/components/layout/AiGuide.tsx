
import React from 'react';
import Spinner from '../ui/Spinner';
import { AiGuideResponse } from '../../types';

interface AiGuideProps {
  content: AiGuideResponse | null;
  isLoading: boolean;
  onSuggestionClick: (suggestion: string) => void;
}

const AiGuide: React.FC<AiGuideProps> = ({ content, isLoading, onSuggestionClick }) => {
  const hasSuggestions = content?.suggestions && content.suggestions.length > 0;

  return (
    <div className="w-full lg:w-1/3 lg:pl-8">
      <div className="sticky top-24 glassmorphism rounded-xl p-6 min-h-[200px] flex flex-col">
        <h3 className="text-lg font-medium tracking-wider text-purple-300 mb-4">AI Guide</h3>
        
        <div className="flex-grow font-light text-gray-300 leading-relaxed">
          {content?.guideText.split('\n').map((line, index) => <p key={index} className="mb-2">{line}</p>)}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <h4 className="text-sm font-medium tracking-wider text-gray-400 mb-3">Suggestions</h4>
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <Spinner />
            </div>
          ) : hasSuggestions ? (
            <div className="flex flex-wrap gap-2 animate-fade-in">
              {content.suggestions?.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="px-3 py-1.5 bg-gray-700/50 text-gray-200 text-sm rounded-full hover:bg-purple-600/50 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm font-light">No suggestions available for this step.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiGuide;