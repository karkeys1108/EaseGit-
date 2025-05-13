import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { GitBranch, Star, Eye, GitFork, Code, ChevronDown, Activity, GitCommit, Calendar, BarChart2 } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const RepositoryAnalytics = ({ repositories }) => {
  const [selectedRepo, setSelectedRepo] = useState(repositories?.[0]?.name || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [commits, setCommits] = useState([]);
  const [loadingCommits, setLoadingCommits] = useState(false);
  
  // Find the selected repository
  const repo = repositories.find(r => r.name === selectedRepo) || repositories[0];
  
  // Fetch latest commits when repository changes
  useEffect(() => {
    const fetchCommits = async () => {
      if (!repo || !repo.owner || !repo.name) {
        console.log('No repository selected or missing owner/name information');
        setCommits([]);
        return;
      }
      
      console.log(`Fetching commits for repository: ${repo.owner.login}/${repo.name}`);
      setLoadingCommits(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/repos/${repo.owner.login}/${repo.name}/commits`, {
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        });
        
        console.log(`Received ${response.data.length} commits for ${repo.name}`);
        setCommits(response.data.slice(0, 5)); // Get the 5 most recent commits
      } catch (error) {
        console.error(`Error fetching commits for ${repo.name}:`, error);
        if (error.response) {
          console.error('Error response:', error.response.status, error.response.data);
        }
        setCommits([]);
      } finally {
        setLoadingCommits(false);
      }
    };
    
    fetchCommits();
  }, [repo]);
  
  if (!repositories || repositories.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md backdrop-filter rounded-lg shadow-lg p-6 border border-white/20 dark:border-gray-700/50">
        <h2 className="text-xl font-bold dark:text-white flex items-center">
          <GitBranch className="h-5 w-5 mr-2" />
          Repository Analytics
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-4">No repository data available.</p>
      </div>
    );
  }
  
  // Language distribution data
  // GitHub API returns languages as an object with language names as keys and byte counts as values
  const languageData = Object.entries(repo.languages || {}).map(([name, value]) => ({
    name,
    value
  }));
  
  // Sort languages by value (descending)
  languageData.sort((a, b) => b.value - a.value);
  
  // Limit to top 6 languages for better visualization
  const topLanguages = languageData.slice(0, 6);
  
  // If there are more languages, add an "Other" category
  if (languageData.length > 6) {
    const otherSum = languageData.slice(6).reduce((sum, item) => sum + item.value, 0);
    if (otherSum > 0) {
      topLanguages.push({
        name: 'Other',
        value: otherSum
      });
    }
  }
  
  // Colors for language pie chart
  const COLORS = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    'C#': '#178600',
    PHP: '#4F5D95',
    Go: '#00ADD8',
    Ruby: '#701516',
    Swift: '#ffac45',
    Kotlin: '#F18E33',
    Rust: '#dea584',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    Other: '#9e9e9e'
  };
  
  // Fallback colors for languages not in the map
  const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Generate realistic activity data based on repo creation date
  const generateActivityData = () => {
    const activityData = [];
    const now = new Date();
    const createdAt = new Date(repo.created_at);
    
    // If the repo was created less than 6 months ago, show monthly data
    // Otherwise show the last 6 months
    const startDate = new Date(Math.max(
      createdAt.getTime(),
      now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000) // 6 months in milliseconds
    ));
    
    // Generate monthly data
    for (let i = 0; i < 6; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      
      // Skip future months
      if (date > now) break;
      
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      // Generate somewhat realistic data based on repo stats
      const baseStars = Math.max(1, Math.floor(repo.stargazers_count / 10));
      const baseForks = Math.max(1, Math.floor(repo.forks_count / 5));
      
      activityData.push({
        name: monthName,
        stars: Math.floor(Math.random() * baseStars * 2) + 1,
        forks: Math.floor(Math.random() * baseForks * 1.5) + 1,
        commits: Math.floor(Math.random() * 20) + 5 // Random number of commits between 5-25
      });
    }
    
    return activityData;
  };
  
  const activityData = generateActivityData();
  
  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const totalBytes = topLanguages.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((payload[0].value / totalBytes) * 100).toFixed(1);
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="font-medium text-gray-900 dark:text-white">{payload[0].name}</p>
          <p className="text-blue-500 dark:text-blue-400">
            <span className="font-medium">{formatNumber(payload[0].value)}</span> bytes
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {percentage}%
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Custom tooltip for activity chart
  const ActivityTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
              {entry.name}: <span className="font-medium">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Format large numbers
  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md backdrop-filter rounded-lg shadow-lg p-6 border border-white/20 dark:border-gray-700/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold dark:text-white flex items-center">
          <GitBranch className="h-5 w-5 mr-2" />
          Repository Analytics
        </h2>
        
        <div className="flex items-center gap-3">
          {repo && repo.owner && (
            <Link 
              to={`/repos/${repo.owner.login}/${repo.name}`}
              className="flex items-center px-3 py-1.5 bg-blue-500/90 text-white rounded-md text-sm font-medium hover:bg-blue-600/90 transition-colors"
            >
              <BarChart2 className="h-4 w-4 mr-1.5" />
              Detailed Analytics
            </Link>
          )}
          
          <div className="relative">
            <button 
              className="flex items-center px-3 py-1.5 bg-white/30 dark:bg-gray-700/50 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/70 transition-colors backdrop-blur-sm"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {selectedRepo}
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-1 w-56 bg-white/90 dark:bg-gray-700/90 rounded-md shadow-lg z-10 backdrop-blur-sm max-h-60 overflow-y-auto">
                <div className="py-1">
                  {repositories.map(repo => (
                    <button
                      key={repo.id}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        selectedRepo === repo.name 
                          ? 'bg-blue-100/70 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-600/50'
                      }`}
                      onClick={() => {
                        setSelectedRepo(repo.name);
                        setShowDropdown(false);
                      }}
                    >
                      {repo.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Repository stats */}
        <div className="bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/30 dark:to-gray-800/30 rounded-xl p-5 backdrop-blur-sm">
          <h3 className="text-md font-medium text-gray-800 dark:text-white mb-4">Repository Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Stars</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{formatNumber(repo.stargazers_count)}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100/50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-3">
                <GitFork className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Forks</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{formatNumber(repo.forks_count)}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-amber-100/50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mr-3">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Watchers</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{formatNumber(repo.watchers_count)}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mr-3">
                <Code className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Size</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{formatNumber(repo.size)} KB</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Repository details */}
        <div className="bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/30 dark:to-gray-800/30 rounded-xl p-5 backdrop-blur-sm">
          <h3 className="text-md font-medium text-gray-800 dark:text-white mb-2">{repo.name}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{repo.description || 'No description available'}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Created</p>
              <p className="text-gray-800 dark:text-white">{new Date(repo.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Last Updated</p>
              <p className="text-gray-800 dark:text-white">{new Date(repo.updated_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Default Branch</p>
              <p className="text-gray-800 dark:text-white">{repo.default_branch}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">License</p>
              <p className="text-gray-800 dark:text-white">{repo.license?.name || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Language distribution */}
        <div className="bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/30 dark:to-gray-800/30 rounded-xl p-5 backdrop-blur-sm">
          <h3 className="text-md font-medium text-gray-800 dark:text-white mb-4 flex items-center">
            <Code className="h-4 w-4 mr-2" />
            Language Distribution
          </h3>
          <div className="h-64">
            {topLanguages.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topLanguages}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {topLanguages.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">No language data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Latest Commits */}
        <div className="bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/30 dark:to-gray-800/30 rounded-xl p-5 backdrop-blur-sm">
          <h3 className="text-md font-medium text-gray-800 dark:text-white mb-4 flex items-center">
            <GitCommit className="h-4 w-4 mr-2" />
            Latest Commits
          </h3>
          <div className="h-64 overflow-y-auto pr-2 custom-scrollbar">
            {loadingCommits ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : commits.length > 0 ? (
              <ul className="space-y-3">
                {commits.map((commit, index) => (
                  <li key={commit.sha || index} className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100/50 dark:border-gray-600/50 backdrop-blur-sm">
                    <div className="flex items-start">
                      <div className="p-2 rounded-full bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0">
                        <GitCommit className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                          {commit.commit?.message || 'No message'}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center mr-3">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(commit.commit?.author?.date || Date.now()).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            {commit.author?.login ? (
                              <span>{commit.author.login}</span>
                            ) : (
                              <span>{commit.commit?.author?.name || 'Unknown author'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <GitCommit className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No commit history available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepositoryAnalytics;
