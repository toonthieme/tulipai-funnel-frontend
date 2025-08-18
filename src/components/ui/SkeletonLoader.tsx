
import React from 'react';

const SkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-700/50 rounded-md ${className}`} />
  );
};

export default SkeletonLoader;
