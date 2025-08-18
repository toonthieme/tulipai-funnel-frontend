
import React from 'react';

interface StepLayoutProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

const StepLayout: React.FC<StepLayoutProps> = ({ leftContent, rightContent }) => {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-start">
        <div className="w-full lg:w-2/3 lg:pr-8">
          {leftContent}
        </div>
        {rightContent}
      </div>
    </div>
  );
};

export default StepLayout;