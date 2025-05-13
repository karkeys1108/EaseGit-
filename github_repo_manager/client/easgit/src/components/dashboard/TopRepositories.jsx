import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Star, GitBranch, ExternalLink } from 'lucide-react';

const TopRepositories = ({ repositories }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full">
      <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center">
        <TrendingUp className="h-5 w-5 mr-2" />
        Top Repositories
      </h2>
      
      <div className="divide-y dark:divide-gray-700">
        {repositories.map(repo => (
          <div 
            key={repo.id} 
            className="py-4 first:pt-0 last:pb-0 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg -mx-4 px-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <Link 
                  to={`/repos/${repo.name}`} 
                  className="text-blue-500 dark:text-blue-400 font-medium hover:underline text-lg truncate block"
                >
                  {repo.name}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {repo.description || 'No description'}
                </p>
                
                {repo.language && (
                  <div className="flex items-center mt-2">
                    <span className={`w-3 h-3 rounded-full mr-1 bg-${getLanguageColor(repo.language)}`}></span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{repo.language}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-end ml-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{repo.stargazers_count}</span>
                  </div>
                  <div className="flex items-center">
                    <GitBranch className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{repo.forks_count}</span>
                  </div>
                </div>
                
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 flex items-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <Link 
          to="/repos" 
          className="inline-flex items-center text-blue-500 dark:text-blue-400 text-sm hover:underline transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-300"
        >
          View All Repositories
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
          </svg>
        </Link>
      </div>
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
