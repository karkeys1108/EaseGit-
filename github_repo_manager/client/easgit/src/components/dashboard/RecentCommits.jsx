import React from 'react';
import { GitCommit } from 'lucide-react';

const RecentCommits = ({ commits }) => {
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full">
      <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center">
        <GitCommit className="h-5 w-5 mr-2" />
        Recent Commits
      </h2>
      
      <div className="divide-y dark:divide-gray-700">
        {commits.map(commit => (
          <div 
            key={commit.id} 
            className="py-4 first:pt-0 last:pb-0 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-750"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <GitCommit className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-gray-800 dark:text-gray-200 font-medium">{commit.message}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(commit.date)}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-xs text-blue-500 dark:text-blue-400">{commit.repo}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <button className="text-blue-500 dark:text-blue-400 text-sm hover:underline transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-300">
          View All Commits
        </button>
      </div>
    </div>
  );
};

export default RecentCommits;
