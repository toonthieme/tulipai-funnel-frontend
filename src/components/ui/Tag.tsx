
import React from 'react';

interface TagProps {
  label: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'purple' | 'green' | 'yellow';
}

const Tag: React.FC<TagProps> = ({ label, icon, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-500/20 text-blue-300',
    purple: 'bg-purple-500/20 text-purple-300',
    green: 'bg-green-500/20 text-green-300',
    yellow: 'bg-yellow-500/20 text-yellow-300',
  };

  return (
    <span className={`inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium ${colors[color]}`}>
      {icon}
      {label}
    </span>
  );
};

export default Tag;
