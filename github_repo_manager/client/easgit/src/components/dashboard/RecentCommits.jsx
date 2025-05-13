import React from 'react';
import { GitCommit } from 'lucide-react';

const RecentCommits = ({ commits = [] }) => {
  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  // Check if commits is valid and not empty
  const hasCommits = Array.isArray(commits) && commits.length > 0;
  
  // Debug output
  console.log('RecentCommits received:', commits);
  console.log('hasCommits:', hasCommits);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full">
      <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center">
        <GitCommit className="h-5 w-5 mr-2" />
        Recent Commits
      </h2>
      
      {hasCommits ? (
        <div className="divide-y dark:divide-gray-700">
          {commits.map((commit, index) => {
            console.log('Processing commit:', commit);
            
            // Check if commit has required properties
            if (!commit) {
              console.log('Invalid commit object at index', index);
              return null;
            }
            
            // Handle different commit data structures
            // GitHub API format
            if (commit.commit) {
              // Safely access commit message
              const commitMessage = commit.commit.message ? 
                commit.commit.message.split('\n')[0] : 
                'No commit message';
                
              // Safely access author information
              const authorName = commit.author?.login || 
                (commit.commit.author ? commit.commit.author.name : 'Unknown');
                
              // Safely access date
              const commitDate = commit.commit.author && commit.commit.author.date ? 
                formatDate(commit.commit.author.date) : 
                'Unknown date';
              
              return (
                <div 
                  key={commit.sha || index} 
                  className="py-3 px-3 mb-3 bg-white/80 dark:bg-gray-700/50 rounded-lg border border-gray-100/50 dark:border-gray-600/50 
                    transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-blue-100/70 dark:hover:border-blue-900/50"
                >
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-blue-100/70 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0
                      transition-transform duration-300 group-hover:scale-110">
                      <GitCommit className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {commitMessage}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2">
                        <span>{authorName}</span>
                        <span>•</span>
                        <span>{commitDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            } 
            // Alternative format (custom API response)
            else {
              // Try to extract information from alternative format
              const commitMessage = commit.message || 'No commit message';
              const authorName = commit.author || 'Unknown';
              const commitDate = commit.date ? formatDate(commit.date) : 'Unknown date';
              
              return (
                <div 
                  key={commit.id || index} 
                  className="py-3 px-3 mb-3 bg-white/80 dark:bg-gray-700/50 rounded-lg border border-gray-100/50 dark:border-gray-600/50 
                    transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-blue-100/70 dark:hover:border-blue-900/50"
                >
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-blue-100/70 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0
                      transition-transform duration-300 group-hover:scale-110">
                      <GitCommit className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {commitMessage}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2">
                        <span>{authorName}</span>
                        <span>•</span>
                        <span>{commitDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No recent commits found</p>
        </div>
      )}
      
      {hasCommits && (
        <div className="mt-4 text-center">
          <button className="text-blue-500 dark:text-blue-400 text-sm hover:underline transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-300">
            View All Commits
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentCommits;
