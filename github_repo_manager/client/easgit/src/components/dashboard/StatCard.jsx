import React from 'react';

const StatCard = ({ 
  icon, 
  title, 
  value, 
  color = 'blue', 
  subtitle = null,
  onClick = null
}) => {
  // Format number with commas for thousands
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div 
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md backdrop-filter rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] border border-white/20 dark:border-gray-700/50"
      onClick={onClick}
    >
      <div className="relative p-4">
        {/* Icon and value */}
        <div className="flex flex-col items-center justify-center mb-2">
          <div className="p-3 mb-3 rounded-full bg-white/30 dark:bg-white/10 text-gray-700 dark:text-gray-300 backdrop-blur-sm">
            {icon}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(value)}</h3>
        </div>
        
        {/* Title and subtitle */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
