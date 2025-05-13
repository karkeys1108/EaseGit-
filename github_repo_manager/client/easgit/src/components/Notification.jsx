import React from 'react';
import { Bell } from 'lucide-react';

const Notification = () => {
  return (
    <div className="relative">
      <Bell 
        className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" 
        size={24} 
      />
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
        3
      </span>
    </div>
  );
};

export default Notification;
