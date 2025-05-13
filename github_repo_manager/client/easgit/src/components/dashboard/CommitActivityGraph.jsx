import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Calendar } from 'lucide-react';

const CommitActivityGraph = ({ commitData }) => {
  const [processedData, setProcessedData] = useState([]);
  
  // Process data for all-time view
  useEffect(() => {
    // Safety check for commitData
    if (!commitData || !Array.isArray(commitData) || commitData.length === 0) {
      console.log('No commit data available or invalid format');
      setProcessedData([]);
      return;
    }
    
    try {
      // All time, grouped by month
      const monthData = {};
      
      // Ensure we have valid dates before sorting
      const validData = commitData.filter(item => {
        try {
          const date = new Date(item.date);
          return !isNaN(date.getTime());
        } catch (err) {
          return false;
        }
      });
      
      // Sort data by date
      const sortedData = [...validData].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
      
      sortedData.forEach(item => {
        try {
          const date = new Date(item.date);
          const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          
          if (!monthData[monthYear]) {
            monthData[monthYear] = { date: monthYear, commits: 0 };
          }
          
          monthData[monthYear].commits += (item.count || 0);
        } catch (err) {
          console.warn('Error processing item for all time view:', err);
        }
      });
      
      // Convert to array and sort by date
      const monthEntries = Object.entries(monthData);
      if (monthEntries.length === 0) {
        console.log('No valid month data found');
        setProcessedData([]);
      } else {
        const groupedData = Object.values(monthData).sort((a, b) => {
          // Parse month names for proper sorting
          const monthOrder = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
          };
          
          const [aMonth, aYear] = a.date.split(' ');
          const [bMonth, bYear] = b.date.split(' ');
          
          if (aYear !== bYear) {
            return parseInt(aYear) - parseInt(bYear);
          }
          
          return monthOrder[aMonth] - monthOrder[bMonth];
        });
        
        setProcessedData(groupedData);
      }
    } catch (error) {
      console.error('Error processing commit data:', error);
      setProcessedData([]);
    }
  }, [commitData]);
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-blue-600 dark:text-blue-400">
            {`${payload[0].value} commits`}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md backdrop-filter rounded-lg shadow-lg p-6 overflow-hidden relative border border-white/20 dark:border-gray-700/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold dark:text-white flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Commit Activity
        </h2>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={processedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#9CA3AF' }}
              axisLine={{ stroke: '#4B5563' }}
              tickLine={{ stroke: '#4B5563' }}
              tickMargin={10}
            />
            <YAxis 
              tick={{ fill: '#9CA3AF' }} 
              axisLine={{ stroke: '#4B5563' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="commits" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ stroke: '#3B82F6', strokeWidth: 2, fill: '#fff', r: 4 }}
              activeDot={{ stroke: '#3B82F6', strokeWidth: 2, fill: '#3B82F6', r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CommitActivityGraph;
