
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="bg-black/20 border border-gray-700/50 rounded-xl p-4 flex flex-col justify-between">
      <h3 className="text-sm font-medium tracking-widest uppercase text-gray-400">{title}</h3>
      <p className="text-4xl font-light text-white mt-2">{value}</p>
    </div>
  );
};

export default StatCard;
