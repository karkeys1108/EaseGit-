import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Star, GitCommit, Calendar, Award, RefreshCw, Trophy, Users } from 'lucide-react';
import axios from 'axios';

const LeaderboardPage = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [category, setCategory] = useState('stars');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [error, setError] = useState(null);

  // Categories for the leaderboard
  const categories = [
    { id: 'stars', name: 'Stars', icon: Star, color: 'text-amber-500' },
    { id: 'commits', name: 'Commits', icon: GitCommit, color: 'text-green-500' },
    { id: 'contributions', name: 'Contributions', icon: Calendar, color: 'text-purple-500' },
    { id: 'streak', name: 'Streak', icon: Award, color: 'text-blue-500' }
  ];

  useEffect(() => {
    fetchLeaderboardData();
    fetchCurrentUser();
  }, [category]);

  useEffect(() => {
    console.log('Current leaderboard state:', leaderboard);
  }, [leaderboard]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      console.log(`Fetching leaderboard data for category: ${category}`);
      
      const response = await axios.get(`http://localhost:5000/api/leaderboard?category=${category}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Leaderboard API response:', response.data);
      
      if (response.data && Array.isArray(response.data.users)) {
        // Debug the response data
        console.log('Raw leaderboard users:', JSON.stringify(response.data.users, null, 2));
        
        // Make sure each user has the stats property
        const usersWithStats = response.data.users.map(user => {
          if (!user.stats) {
            console.log(`User ${user.username} has no stats, adding empty stats object`);
            return {
              ...user,
              stats: {
                totalStars: 0,
                totalCommits: 0,
                totalContributions: 0,
                currentStreak: 0
              }
            };
          }
          return user;
        });
        
        setLeaderboard(usersWithStats);
        setLastUpdated(new Date(response.data.lastUpdated));
        console.log(`Got ${usersWithStats.length} users for leaderboard`);
      } else {
        console.log('No users found in leaderboard data or invalid format');
        setLeaderboard([]);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      if (error.response) {
        console.error('API error response:', error.response.data);
      }
      setError('Failed to load leaderboard data. Please try again later.');
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
        console.log(`Got current user: ${userData.login}`);
        
        // Update user stats in MongoDB first
        const token = localStorage.getItem('token');
        console.log('Updating user stats in MongoDB');
        await axios.post('http://localhost:5000/api/user/stats', {}, {
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        });
        
        // Fetch user position in leaderboard
        console.log(`Fetching position for user: ${userData.login}`);
        const response = await axios.get(`http://localhost:5000/api/leaderboard/position/${userData.login}?category=${category}`, {
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        });
        
        if (response.data) {
          console.log(`User position response:`, response.data);
          setUserPosition(response.data);
          console.log(`User position: ${response.data.position} of ${response.data.total}, value: ${response.data.value}`);
        }
      } else {
        console.log('No user data found in localStorage');
      }
    } catch (error) {
      console.error('Error fetching user position:', error);
      if (error.response) {
        console.error('API error response:', error.response.data);
      }
    }
  };

  const refreshUserStats = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      
      console.log('Manually refreshing user stats');
      // Trigger a refresh of the user stats
      const refreshResponse = await axios.post('http://localhost:5000/api/leaderboard/refresh', {}, {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
      console.log('Refresh response:', refreshResponse.data);
      
      if (refreshResponse.data.stats) {
        console.log('Updated stats received:', refreshResponse.data.stats);
        
        // If we got updated stats directly from the refresh endpoint, update the UI
        if (currentUser) {
          // Create a user object with the updated stats
          const updatedUser = {
            username: currentUser.login,
            name: currentUser.name || currentUser.login,
            avatarUrl: currentUser.avatar_url,
            stats: refreshResponse.data.stats
          };
          
          // Update the leaderboard with this user
          setLeaderboard([updatedUser]);
          
          // Update the user position
          const categoryValue = getValueFromStats(refreshResponse.data.stats, category);
          setUserPosition({
            position: 1,
            total: 1,
            value: categoryValue
          });
          
          console.log(`Updated leaderboard with user ${currentUser.login}, value: ${categoryValue}`);
        }
      }
      
      // Fetch the latest leaderboard data
      await fetchLeaderboardData();
      
      // Fetch the user's position
      await fetchCurrentUser();
      
      setRefreshing(false);
    } catch (error) {
      console.error('Error refreshing user stats:', error);
      if (error.response) {
        console.error('API error response:', error.response.data);
      }
      setRefreshing(false);
    }
  };

  const getValueFromStats = (stats, category) => {
    if (!stats) return 0;
    
    switch (category) {
      case 'commits':
        return stats.totalCommits || 0;
      case 'contributions':
        return stats.totalContributions || 0;
      case 'streak':
        return stats.currentStreak || 0;
      case 'stars':
      default:
        return stats.totalStars || 0;
    }
  };

  const refreshLeaderboard = refreshUserStats;

  // Function to get the value for a specific category from a user object
  const getValueForCategory = (user) => {
    if (!user || !user.stats) {
      console.log('User or user.stats is undefined:', user);
      return 0;
    }
    
    console.log(`Getting value for category ${category} from user:`, user.username);
    console.log('User stats:', user.stats);
    
    let value = 0;
    switch (category) {
      case 'commits':
        value = user.stats.totalCommits || 0;
        break;
      case 'contributions':
        value = user.stats.totalContributions || 0;
        break;
      case 'streak':
        value = user.stats.currentStreak || 0;
        break;
      case 'stars':
      default:
        value = user.stats.totalStars || 0;
        break;
    }
    
    console.log(`Value for ${category}: ${value}`);
    return value;
  };

  // Simple function to format date relative to now
  const formatRelativeTime = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  };

  const getCategoryIcon = () => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData ? categoryData.icon : Star;
  };

  const getCategoryColor = () => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData ? categoryData.color : 'text-amber-500';
  };

  return (
    <div className={`min-h-screen py-6 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <Trophy className="inline-block w-8 h-8 mr-2 text-yellow-500" />
            GitHub Leaderboard
          </h2>
          <p className={`mt-2 text-base sm:text-lg ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            See how you rank among other GitHub users
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6">
          {/* Leaderboard Component */}
          <motion.div 
            className={`rounded-xl overflow-hidden shadow-md ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>GitHub Leaderboard</h2>
                </div>
                <button
                  onClick={refreshLeaderboard}
                  disabled={refreshing}
                  className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}
                  title="Refresh Leaderboard"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''} ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
              
              {lastUpdated && (
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Last updated: {formatRelativeTime(lastUpdated)}
                </p>
              )}
            </div>
            
            {/* Category Tabs */}
            <div className="flex px-4 pt-2 border-b border-gray-200 dark:border-gray-700">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    category === cat.id
                      ? `border-blue-500 ${isDark ? 'text-blue-400' : 'text-blue-600'}`
                      : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                  }`}
                >
                  <div className="flex items-center">
                    <cat.icon className={`w-4 h-4 mr-1 ${category === cat.id ? cat.color : ''}`} />
                    {cat.name}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded relative m-4" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}
            
            {/* Leaderboard Table */}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className={isDark ? 'bg-gray-700/30' : 'bg-gray-50'}>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rank
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <div className="flex items-center justify-end">
                          {React.createElement(getCategoryIcon(), { className: `w-4 h-4 mr-1 ${getCategoryColor()}` })}
                          {categories.find(c => c.id === category)?.name || 'Stars'}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
                    {currentUser ? (
                      <motion.tr 
                        key={currentUser.login}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} transition-colors duration-150`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 dark:bg-opacity-20`}>
                              <Trophy className="w-4 h-4" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full" src={currentUser.avatar_url} alt={currentUser.login} />
                            </div>
                            <div className="ml-4">
                              <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {currentUser.name || currentUser.login}
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                @{currentUser.login}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {userPosition && userPosition.value !== undefined ? userPosition.value.toLocaleString() : '0'}
                          </div>
                        </td>
                      </motion.tr>
                    ) : leaderboard && leaderboard.length > 0 ? (
                      leaderboard.map((user, index) => (
                        <motion.tr 
                          key={user.username || `user-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`${
                            currentUser && user.username === currentUser.login
                              ? isDark ? 'bg-blue-900/20' : 'bg-blue-50'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                          } transition-colors duration-150`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {index < 3 ? (
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                  index === 0 ? 'bg-yellow-100 text-yellow-600' :
                                  index === 1 ? 'bg-gray-100 text-gray-600' :
                                  'bg-amber-100 text-amber-800'
                                } dark:bg-opacity-20`}>
                                  {index === 0 && <Trophy className="w-4 h-4" />}
                                  {index === 1 && <span className="text-sm font-bold">2</span>}
                                  {index === 2 && <span className="text-sm font-bold">3</span>}
                                </div>
                              ) : (
                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{index + 1}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.username} />
                              </div>
                              <div className="ml-4">
                                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {user.name || user.username}
                                </div>
                                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  @{user.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {user.stats ? getValueForCategory(user).toLocaleString() : '0'}
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          Loading your stats...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* User's Position (if not in top 10) */}
            {currentUser && userPosition && userPosition.position > 0 && (
              <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <img className="h-8 w-8 rounded-full" src={currentUser.avatar_url} alt={currentUser.login} />
                    </div>
                    <div className="ml-3">
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        You
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        @{currentUser.login}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Rank: {userPosition.position} of {Math.max(userPosition.total, 1)}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {categories.find(c => c.id === category)?.name || 'Stars'}: {userPosition.value ? userPosition.value.toLocaleString() : '0'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`p-6 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm border border-gray-100'}`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              How the Leaderboard Works
            </h3>
            <div className={`prose ${isDark ? 'prose-invert' : ''} max-w-none`}>
              <p>
                The EaseGit leaderboard ranks GitHub users based on various metrics:
              </p>
              <ul>
                <li><strong>Stars</strong> - Total number of stars across all your repositories</li>
                <li><strong>Commits</strong> - Total number of commits you've made</li>
                <li><strong>Contributions</strong> - Total number of contributions to GitHub (includes commits, PRs, issues, etc.)</li>
                <li><strong>Streak</strong> - Your current consecutive days of activity on GitHub</li>
              </ul>
              <p>
                Your stats are updated whenever you visit the dashboard or manually refresh the leaderboard.
                The system also performs daily updates to keep the rankings current.
              </p>
              <p>
                Want to improve your ranking? Keep contributing to open source projects, create valuable repositories
                that others will star, and maintain a consistent contribution streak!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
