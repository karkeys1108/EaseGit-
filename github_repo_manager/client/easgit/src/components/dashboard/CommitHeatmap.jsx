import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const CommitHeatmap = ({ commitData }) => {
  const [tooltipInfo, setTooltipInfo] = useState(null);
  
  // Group commits by week for better visualization
  const weeks = [];
  let currentWeek = [];
  
  // Process commit data into weeks (7 days per week)
  for (let i = 0; i < commitData.length; i++) {
    currentWeek.push(commitData[i]);
    if (currentWeek.length === 7 || i === commitData.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  }
  
  // Get day name from date
  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Handle mouse events for tooltip
  const handleMouseEnter = (day, event) => {
    const rect = event.target.getBoundingClientRect();
    setTooltipInfo({
      day,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY
    });
  };
  
  const handleMouseLeave = () => {
    setTooltipInfo(null);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-hidden">
      <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center">
        <Calendar className="h-5 w-5 mr-2" />
        Commit Activity
      </h2>
      
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex mb-2 pl-10">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
              <div key={month} className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400">
                {month}
              </div>
            ))}
          </div>
          
          {/* Day labels and heatmap grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col justify-between pr-2 text-xs text-gray-500 dark:text-gray-400">
              {['Mon', 'Wed', 'Fri'].map(day => (
                <div key={day} className="h-6 flex items-center">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            <div className="flex-1">
              <div className="grid grid-flow-col gap-1 auto-cols-min">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-rows-7 gap-1">
                    {week.map((day, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`w-3 h-3 rounded-sm ${getCommitColorClass(day.count)} 
                          transform transition-all duration-200 hover:scale-125 cursor-pointer`}
                        onMouseEnter={(e) => handleMouseEnter(day, e)}
                        onMouseLeave={handleMouseLeave}
                      ></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex justify-end mt-4">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span>Less</span>
              <div className="flex mx-2">
                <div className="w-3 h-3 rounded-sm bg-green-100 dark:bg-green-900 mx-px"></div>
                <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-800 mx-px"></div>
                <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-700 mx-px"></div>
                <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600 mx-px"></div>
                <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-500 mx-px"></div>
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tooltip */}
      {tooltipInfo && (
        <div 
          className="absolute z-10 bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none"
          style={{ 
            left: `${tooltipInfo.x}px`, 
            top: `${tooltipInfo.y - 40}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-semibold">{formatDate(tooltipInfo.day.date)}</div>
          <div>{tooltipInfo.day.count} commits</div>
        </div>
      )}
    </div>
  );
};

// Helper function to get color class based on commit count
const getCommitColorClass = (count) => {
  if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
  if (count < 3) return 'bg-green-100 dark:bg-green-900';
  if (count < 5) return 'bg-green-200 dark:bg-green-800';
  if (count < 7) return 'bg-green-300 dark:bg-green-700';
  if (count < 9) return 'bg-green-400 dark:bg-green-600';
  return 'bg-green-500 dark:bg-green-500';
};

export default CommitHeatmap;
