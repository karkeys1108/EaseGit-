import React from 'react';
import { Lightbulb } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const DailyTip = ({ tip }) => {
  const { isDark } = useTheme();

  return (
    <div className={`${
      isDark ? 'bg-gradient-to-br from-blue-900 to-indigo-900' : 
      'bg-gradient-to-br from-blue-500 to-indigo-600'
    } rounded-xl p-8 text-white`}>
      <div className="flex items-start">
        <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
          <Lightbulb className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-xl font-semibold">{tip.title}</h3>
          <p className="mt-2 text-blue-50">{tip.description}</p>
          <span className="inline-block mt-3 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm">
            {tip.difficulty}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DailyTip;
