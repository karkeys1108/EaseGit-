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
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md backdrop-filter rounded-xl shadow-xl p-6 border border-white/20 dark:border-gray-700/50 overflow-hidden">
      <div className="flex flex-col space-y-6">
        {/* Header with repository selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            <GitBranch className="h-5 w-5 mr-2 text-blue-500" />
            Repository Analytics
          </h2>
          
          <div className="relative">
            <button
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-blue-100 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="mr-2 font-medium truncate max-w-[150px]">{selectedRepo}</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showDropdown ? 'transform rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-10 max-h-60 overflow-y-auto custom-scrollbar">
                {repositories.map(repo => (
                  <button
                    key={repo.id}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    onClick={() => {
                      setSelectedRepo(repo.name);
                      setShowDropdown(false);
                    }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-md flex items-center justify-center text-blue-600 dark:text-blue-400">
                      {repo.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-white truncate">{repo.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{repo.owner?.login || 'Unknown owner'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Repository stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50/70 to-blue-100/70 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-100/50 dark:border-blue-800/30 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Stars</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{formatNumber(repo.stargazers_count || 0)}</p>
              </div>
              <div className="p-2 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
                <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50/70 to-purple-100/70 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-100/50 dark:border-purple-800/30 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Watchers</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{formatNumber(repo.watchers_count || 0)}</p>
              </div>
              <div className="p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-lg">
                <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50/70 to-green-100/70 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-100/50 dark:border-green-800/30 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600 dark:text-green-400">Forks</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{formatNumber(repo.forks_count || 0)}</p>
              </div>
              <div className="p-2 bg-green-100/50 dark:bg-green-900/30 rounded-lg">
                <GitFork className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50/70 to-amber-100/70 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-4 border border-amber-100/50 dark:border-amber-800/30 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Issues</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{formatNumber(repo.open_issues_count || 0)}</p>
              </div>
              <div className="p-2 bg-amber-100/50 dark:bg-amber-900/30 rounded-lg">
                <Code className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Repository details */}
          <div className="bg-gradient-to-br from-gray-50/70 to-gray-100/70 dark:from-gray-900/30 dark:to-gray-800/30 rounded-xl p-5 backdrop-blur-sm shadow-sm border border-gray-100/50 dark:border-gray-700/30">
            <h3 className="text-md font-medium text-gray-800 dark:text-white mb-4 flex items-center">
              <GitBranch className="h-4 w-4 mr-2 text-blue-500" />
              Repository Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Repository Name</h4>
                <p className="text-sm font-medium text-gray-800 dark:text-white mt-1">{repo.name}</p>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Description</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{repo.description || 'No description provided'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Created</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {new Date(repo.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Last Updated</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {new Date(repo.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Default Branch</h4>
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                    <GitBranch className="h-3 w-3 mr-1" />
                    {repo.default_branch || 'main'}
                  </span>
                </div>
              </div>
              
              <div>
                <Link 
                  to={`/repos/${repo.owner?.login}/${repo.name}`}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors mt-2"
                >
                  View Repository Details
                  <svg className="w-3.5 h-3.5 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Language distribution */}
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 backdrop-blur-sm shadow-sm border border-blue-100/50 dark:border-indigo-800/30">
            <h3 className="text-md font-medium text-gray-800 dark:text-white mb-4 flex items-center">
              <Code className="h-4 w-4 mr-2 text-blue-500" />
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
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {topLanguages.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      layout="vertical" 
                      verticalAlign="middle" 
                      align="right"
                      iconType="circle"
                      iconSize={10}
                      formatter={(value) => (
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Code className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">No language data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Latest Commits */}
          <div className="bg-gradient-to-br from-gray-50/70 to-gray-100/70 dark:from-gray-900/30 dark:to-gray-800/30 rounded-xl p-5 backdrop-blur-sm shadow-sm border border-gray-100/50 dark:border-gray-700/30 md:col-span-2">
            <h3 className="text-md font-medium text-gray-800 dark:text-white mb-4 flex items-center">
              <GitCommit className="h-4 w-4 mr-2 text-blue-500" />
              Latest Commits
            </h3>
            <div className="h-64 overflow-y-auto pr-2 custom-scrollbar">
              {loadingCommits ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : commits.length > 0 ? (
                <ul className="space-y-3">
                  {commits.map((commit, index) => (
                    <li key={commit.sha || index} className="bg-white/70 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100/50 dark:border-gray-600/50 backdrop-blur-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start">
                        <div className="p-2 rounded-full bg-blue-100/70 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0">
                          <GitCommit className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                            {commit.commit?.message || 'No message'}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center mr-3">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(commit.commit?.author?.date || Date.now()).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              {commit.author?.avatar_url && (
                                <img 
                                  src={commit.author.avatar_url} 
                                  alt={commit.author.login}
                                  className="w-4 h-4 rounded-full mr-1"
                                />
                              )}
                              <span>
                                {commit.author?.login ? (
                                  <span className="font-medium">{commit.author.login}</span>
                                ) : (
                                  <span>{commit.commit?.author?.name || 'Unknown author'}</span>
                                )}
                              </span>
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
    </div>
  );
};

export default RepositoryAnalytics;
