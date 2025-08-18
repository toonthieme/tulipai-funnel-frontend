
import React from 'react';
import { SubmissionStatus } from '../../types';

interface StatusBarChartProps {
  data: {
    status: SubmissionStatus;
    count: number;
    color: string;
  }[];
  total: number;
}

const StatusBarChart: React.FC<StatusBarChartProps> = ({ data, total }) => {
  if (total === 0) {
    return <div className="text-center text-gray-500 font-light py-4">No data to display.</div>;
  }
  
  return (
    <div>
      <div className="flex w-full h-4 bg-gray-700/50 rounded-full overflow-hidden">
        {data.filter(d => d.count > 0).map(({ status, count, color }) => {
          const percentage = (count / total) * 100;
          return (
            <div
              key={`bar-${status}`}
              className={`h-full ${color} transition-all duration-300`}
              style={{ width: `${percentage}%` }}
              title={`${status}: ${count} (${percentage.toFixed(1)}%)`}
            />
          );
        })}
      </div>
      <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mt-4">
        {data.filter(d => d.count > 0).map(({ status, color, count }) => (
          <div key={`legend-${status}`} className="flex items-center text-sm">
            <span key={`dot-${status}`} className={`w-3 h-3 rounded-full mr-2 ${color}`}></span>
            <span key={`label-${status}`} className="text-gray-400 font-light">{status}</span>
            <span key={`count-${status}`} className="text-white font-medium ml-1.5">({count})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusBarChart;
