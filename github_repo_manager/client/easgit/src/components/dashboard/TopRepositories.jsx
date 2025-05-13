import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Star, GitBranch, ExternalLink, ArrowRight } from 'lucide-react';

const TopRepositories = ({ repositories = [] }) => {
  // Check if repositories is valid and not empty
  const hasRepositories = Array.isArray(repositories) && repositories.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full">
      <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center">
        <TrendingUp className="h-5 w-5 mr-2" />
        Top Repositories
      </h2>
      
      {hasRepositories ? (
        <div className="space-y-4">
          {repositories.map((repo, index) => {
            // Skip invalid repositories
            if (!repo) return null;
            
            return (
              <div 
                key={repo.id || index} 
                className="relative overflow-hidden group rounded-lg border border-gray-100 dark:border-gray-700 
                  transition-all duration-300 hover:shadow-lg hover:-translate-y-1 
                  bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-750
                  hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20"
              >
                {/* Decorative elements that appear on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 
                  group-hover:from-blue-500/0 group-hover:via-blue-500/5 group-hover:to-indigo-500/10 
                  dark:group-hover:from-blue-400/0 dark:group-hover:via-blue-400/5 dark:group-hover:to-indigo-400/10 
                  transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                
                <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-blue-400/0 via-blue-400/0 to-blue-400/0
                  group-hover:from-blue-400 group-hover:via-indigo-500 group-hover:to-purple-500
                  dark:group-hover:from-blue-400 dark:group-hover:via-indigo-400 dark:group-hover:to-purple-400
                  transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                
                <div className="py-4 px-5 relative">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/repos/${repo.name || ''}`} 
                        className="text-blue-500 dark:text-blue-400 font-medium hover:underline text-lg truncate block
                          transition-all duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-300"
                      >
                        {repo.name || 'Unnamed Repository'}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                        {repo.description || 'No description'}
                      </p>
                      
                      {repo.language && (
                        <div className="flex items-center mt-2">
                          <span className={`w-3 h-3 rounded-full mr-1 bg-${getLanguageColor(repo.language)} 
                            transition-transform duration-300 group-hover:scale-110`}></span>
                          <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">
                            {repo.language}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end ml-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center group-hover:scale-110 transition-transform duration-300">
                          <Star className="h-4 w-4 text-yellow-500 mr-1 group-hover:text-yellow-400 transition-colors duration-300" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">
                            {repo.stargazers_count || 0}
                          </span>
                        </div>
                        <div className="flex items-center group-hover:scale-110 transition-transform duration-300">
                          <GitBranch className="h-4 w-4 text-gray-500 mr-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">
                            {repo.forks_count || 0}
                          </span>
                        </div>
                      </div>
                      
                      {repo.html_url && (
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 
                            flex items-center group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-300"
                        >
                          <ExternalLink className="h-3 w-3 mr-1 transition-transform duration-300 group-hover:scale-110" />
                          <span className="group-hover:underline">View on GitHub</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No repositories found</p>
        </div>
      )}
      
      {hasRepositories && (
        <div className="mt-6 text-center">
          <Link 
            to="/repos" 
            className="inline-flex items-center text-blue-500 dark:text-blue-400 text-sm hover:underline 
              transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-300 
              px-4 py-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 group"
          >
            View All Repositories
            <ArrowRight className="w-4 h-4 ml-1 transform transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );
};

// Helper function to get language color
const getLanguageColor = (language) => {
  const colors = {
    JavaScript: 'yellow-400',
    TypeScript: 'blue-400',
    Python: 'blue-500',
    Java: 'orange-500',
    Ruby: 'red-500',
    PHP: 'indigo-400',
    CSS: 'purple-500',
    HTML: 'red-600',
    Go: 'blue-300',
    Rust: 'orange-600',
    C: 'gray-500',
    'C++': 'pink-500',
    'C#': 'green-500',
  };
  
  return colors[language] || 'gray-400';
};

export default TopRepositories;
