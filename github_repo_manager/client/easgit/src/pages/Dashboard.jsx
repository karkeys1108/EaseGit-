import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import StatCard from '../components/dashboard/StatCard';
import RecentCommits from '../components/dashboard/RecentCommits';
import TopRepositories from '../components/dashboard/TopRepositories';
import CommitActivityGraph from '../components/dashboard/CommitActivityGraph';
import RepositoryAnalytics from '../components/dashboard/RepositoryAnalytics';
import { GitBranch, Star, GitCommit, Flame, Award, Calendar, Trophy, Globe, Mail, Twitter, Github, Linkedin } from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [stats, setStats] = useState({
    totalRepos: 0,
    totalStars: 0,
    totalForks: 0,
    totalWatchers: 0,
    totalCommits: 0,
    totalContributions: 0,
    currentStreak: 0,
    longestStreak: 0
  });
  const [recentCommits, setRecentCommits] = useState([]);
  const [commitActivity, setCommitActivity] = useState([]);
  const [error, setError] = useState(null);
  const [githubStats, setGithubStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Get user data from server
      let userData;
      try {
        const userResponse = await axios.get('http://localhost:5000/api/user', {
          headers: { 
            Authorization: `token ${token}` 
          }
        });
        userData = userResponse.data;
        console.log('User data fetched successfully:', userData.login);
        
        // Set GitHub Stats URL
        setGithubStats(`https://github-readme-stats.vercel.app/api?username=${userData.login}&show_icons=true&count_private=true&hide=prs&theme=radical`);
        
        // Store user stats in MongoDB for leaderboard
        try {
          console.log('Updating user stats in MongoDB...');
          const statsResponse = await axios.post('http://localhost:5000/api/user/stats', {}, {
            headers: { 
              Authorization: `token ${token}`
            }
          });
          
          if (statsResponse.data && statsResponse.data.stats) {
            console.log('User stats updated successfully in MongoDB');
            // Use the stats from MongoDB if available
            setStats(statsResponse.data.stats);
          } else {
            // Fallback to fetching stats directly from GitHub API
            fetchStatsFromGitHub(userData.login, token);
          }
        } catch (error) {
          console.warn('Error updating user stats in MongoDB:', error);
          // Fallback to fetching stats directly from GitHub API
          fetchStatsFromGitHub(userData.login, token);
        }
      } catch (error) {
        console.warn('Error fetching user data from API, using localStorage instead:', error);
        // Fallback to localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          userData = JSON.parse(storedUser);
          console.log('Using stored user data for:', userData.login);
          setGithubStats(`https://github-readme-stats.vercel.app/api?username=${userData.login}&show_icons=true&count_private=true&hide=prs&theme=radical`);
          fetchStatsFromGitHub(userData.login, token);
        } else {
          throw new Error('No user data available');
        }
      }
      
      // Enhance user data with additional fields if missing
      if (!userData.bio) {
        userData.bio = "GitHub enthusiast and developer";
      }
      if (!userData.company) {
        userData.company = "GitHub";
      }
      if (!userData.location) {
        userData.location = "San Francisco, CA";
      }
      if (!userData.blog) {
        userData.blog = "github.com/blog";
      }
      if (!userData.created_at) {
        userData.created_at = "2020-01-01T00:00:00Z";
      }
      
      setUser(userData);

      // Fetch repositories from server with pagination
      let allRepos = [];
      let currentPage = 1;
      let hasMorePages = true;
      
      try {
        console.log('Starting repository fetch...');
        
        // Fetch repositories with pagination - get all pages
        while (hasMorePages && currentPage <= 10) { // Limit to 10 pages to avoid excessive requests
          console.log(`Fetching repositories page ${currentPage}...`);
          
          const reposResponse = await axios.get('http://localhost:5000/api/user/repos', {
            params: {
              per_page: 100,
              page: currentPage,
              sort: 'updated',
              direction: 'desc'
            },
            headers: { 
              Authorization: `token ${token}` 
            }
          });
          
          // Check if we're using the new response format
          if (reposResponse.data.repositories) {
            // New format with pagination info
            const { repositories, pagination } = reposResponse.data;
            
            if (repositories && Array.isArray(repositories)) {
              allRepos = [...allRepos, ...repositories];
              hasMorePages = pagination.hasMorePages;
              
              console.log(`Fetched ${repositories.length} repositories on page ${currentPage}`);
              console.log(`Pagination info:`, pagination);
            } else {
              console.warn('Received invalid repositories data:', repositories);
              hasMorePages = false;
            }
          } else {
            // Old format (direct array)
            if (Array.isArray(reposResponse.data)) {
              allRepos = [...allRepos, ...reposResponse.data];
              console.log(`Fetched ${reposResponse.data.length} repositories (old format)`);
            } else {
              console.warn('Received invalid repositories data (old format):', reposResponse.data);
            }
            hasMorePages = false; // No pagination info, so stop after first page
          }
          
          console.log(`Total repositories fetched so far: ${allRepos.length}`);
          
          // Move to next page
          currentPage++;
          
          // If we have enough repos already, no need to fetch more
          if (allRepos.length >= 100) {
            console.log('Reached 100+ repositories, stopping pagination');
            break;
          }
        }
        
        console.log(`Finished fetching repositories. Total count: ${allRepos.length}`);
      } catch (error) {
        console.error('Error fetching repositories:', error);
        // Don't generate mock repositories, just use an empty array
        console.log('Using empty repository list due to error');
      }
      
      // Sort repositories by stars (descending)
      const sortedRepos = [...allRepos].sort((a, b) => b.stargazers_count - a.stargazers_count);
      
      // Calculate stats
      const totalStars = sortedRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
      const totalForks = sortedRepos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
      const totalWatchers = sortedRepos.reduce((sum, repo) => sum + (repo.watchers_count || 0), 0);
      
      setStats({
        totalRepos: sortedRepos.length,
        totalStars,
        totalForks,
        totalWatchers
      });

      // Fetch language data for each repository (limit to top 20 repos to avoid excessive API calls)
      const topRepos = sortedRepos.slice(0, 20);
      console.log(`Fetching language data for top ${topRepos.length} repositories...`);
      
      const reposWithLanguages = await Promise.all(
        topRepos.map(async (repo) => {
          if (!repo.owner || !repo.name) {
            console.warn(`Repository missing owner or name:`, repo);
            return repo; // Return repo without languages
          }
          
          try {
            console.log(`Fetching language data for ${repo.name}...`);
            const languageResponse = await axios.get(`http://localhost:5000/api/repos/${repo.owner.login}/${repo.name}/languages`, {
              headers: { 
                Authorization: `token ${token}` 
              }
            });
            
            const languages = languageResponse.data;
            
            return {
              ...repo,
              languages: languages || {}
            };
          } catch (error) {
            console.warn(`Error fetching language data for ${repo.name}:`, error);
            return {
              ...repo,
              languages: {} // Empty languages object
            };
          }
        })
      );
      
      // Combine repos with languages with the remaining repos
      const allReposWithLanguages = [
        ...reposWithLanguages,
        ...sortedRepos.slice(20).map(repo => ({
          ...repo,
          languages: {} // Empty languages object for repos we didn't fetch languages for
        }))
      ];
      
      setRepositories(allReposWithLanguages);
      
      // Try to fetch commits
      try {
        const commitsResponse = await axios.get('http://localhost:5000/api/user/commits', {
          headers: { 
            // GitHub requires "token" prefix
            Authorization: `token ${token}` 
          }
        });
        
        const commitsData = commitsResponse.data;
        console.log('Commits API response:', commitsData);
        
        // Initialize with empty array
        let processedCommits = [];
        
        if (commitsData) {
          // Handle new response format with totalCount
          if (commitsData.commits && Array.isArray(commitsData.commits)) {
            console.log(`Fetched ${commitsData.commits.length} recent commits out of ${commitsData.totalCount} total commits`);
            processedCommits = commitsData.commits;
            
            // Update stats with total commit count
            setStats(prevStats => ({
              ...prevStats,
              totalCommits: commitsData.totalCount || 0
            }));
          } 
          // Handle old response format (direct array)
          else if (Array.isArray(commitsData)) {
            console.log(`Fetched ${commitsData.length} commits (old format)`);
            processedCommits = commitsData;
            
            // Update stats with commit count from array
            setStats(prevStats => ({
              ...prevStats,
              totalCommits: commitsData.length || 0
            }));
          }
          else {
            // No valid commits data
            console.log('No valid commits data found, data type:', typeof commitsData);
            processedCommits = [];
            
            // Update stats with zero commits
            setStats(prevStats => ({
              ...prevStats,
              totalCommits: 0
            }));
          }
        } else {
          // Use empty array if no commits found
          console.log('No commits data found');
          processedCommits = [];
          
          // Update stats with zero commits
          setStats(prevStats => ({
            ...prevStats,
            totalCommits: 0
          }));
        }
        
        // Ensure we're setting a valid array
        if (!Array.isArray(processedCommits)) {
          console.warn('Processed commits is not an array, setting to empty array');
          processedCommits = [];
        }
        
        // Add mock data if in development and no commits found
        if (processedCommits.length === 0 && process.env.NODE_ENV === 'development') {
          console.log('Adding mock commit data for development');
          processedCommits = [
            {
              sha: 'mock1',
              commit: {
                message: 'Fix dashboard layout issues',
                author: {
                  name: 'Developer',
                  date: new Date().toISOString()
                }
              },
              author: {
                login: 'dev1'
              }
            },
            {
              sha: 'mock2',
              commit: {
                message: 'Add new features to repository page',
                author: {
                  name: 'Developer',
                  date: new Date(Date.now() - 86400000).toISOString()
                }
              },
              author: {
                login: 'dev2'
              }
            }
          ];
        }
        
        console.log('Setting recent commits:', processedCommits);
        setRecentCommits(processedCommits);
        
      } catch (error) {
        console.warn('Error fetching commit data:', error);
        setRecentCommits([]);
        
        // Update stats with zero commits
        setStats(prevStats => ({
          ...prevStats,
          totalCommits: 0
        }));
      }
      
      // Try to fetch commit activity data
      try {
        const activityResponse = await axios.get('http://localhost:5000/api/user/activity', {
          headers: { 
            Authorization: `token ${token}` 
          }
        });
        
        const activityData = activityResponse.data;
        
        if (activityData && activityData.length > 0) {
          console.log(`Fetched activity data for ${activityData.filter(d => d.count > 0).length} days with commits`);
          setCommitActivity(activityData);
          
          // Calculate total contributions
          const totalContributions = activityData.reduce((total, day) => total + day.count, 0);
          
          // Calculate current streak
          let currentStreak = 0;
          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          // Sort by date (newest first)
          const sortedActivity = [...activityData].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          );
          
          // Check if there's a commit today or yesterday to start the streak
          const hasRecentCommit = sortedActivity.some(day => 
            (day.date === today || day.date === yesterdayStr) && day.count > 0
          );
          
          if (hasRecentCommit) {
            // Count consecutive days with commits
            for (let i = 0; i < sortedActivity.length - 1; i++) {
              const currentDate = new Date(sortedActivity[i].date);
              const nextDate = new Date(sortedActivity[i+1].date);
              const dayDiff = Math.round((currentDate - nextDate) / (1000 * 60 * 60 * 24));
              
              if (sortedActivity[i].count > 0 && dayDiff <= 1) {
                currentStreak++;
              } else {
                break;
              }
            }
          }
          
          // Calculate longest streak
          let longestStreak = 0;
          let currentLongestStreak = 0;
          
          // Sort by date (oldest first)
          const chronologicalActivity = [...activityData].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
          );
          
          for (let i = 0; i < chronologicalActivity.length; i++) {
            if (chronologicalActivity[i].count > 0) {
              currentLongestStreak++;
              
              if (currentLongestStreak > longestStreak) {
                longestStreak = currentLongestStreak;
              }
            } else {
              currentLongestStreak = 0;
            }
          }
          
          // Update stats with the new values
          setStats(prevStats => ({
            ...prevStats,
            totalContributions,
            currentStreak,
            longestStreak
          }));
          
        } else {
          // Use empty array if no activity data found
          console.log('No activity data found');
          setCommitActivity([]);
        }
      } catch (error) {
        console.warn('Error fetching activity data:', error);
        setCommitActivity([]);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to fetch stats directly from GitHub API
  const fetchStatsFromGitHub = async (username, token) => {
    try {
      const statsResponse = await axios.get(`https://api.github.com/users/${username}`, {
        headers: { 
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });
      
      // Update contribution count from GitHub Stats
      if (statsResponse.data && statsResponse.data.public_repos) {
        setStats(prevStats => ({
          ...prevStats,
          totalContributions: statsResponse.data.public_repos + (statsResponse.data.total_private_repos || 0)
        }));
      }
    } catch (error) {
      console.warn('Error fetching GitHub Stats data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-8 max-w-7xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Profile and Stats */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Professional Profile Card */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          {/* Premium gradient header */}
          <div className="h-24 bg-gradient-to-r from-emerald-500 to-blue-500 relative overflow-hidden">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/30 via-cyan-500/30 to-blue-500/30 animate-gradient-x"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
              <div className="absolute top-0 left-5 w-16 h-16 rounded-full bg-white/20 blur-xl"></div>
              <div className="absolute bottom-5 right-10 w-12 h-12 rounded-full bg-blue-300/30 blur-xl"></div>
            </div>
          </div>
          
          <div className="px-6 pb-6 pt-14 relative">
            {/* Avatar */}
            <div className="absolute left-6 -top-10">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 blur-md opacity-70 scale-110"></div>
                
                {/* Avatar image */}
                <div className="relative w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden z-10">
                  <img 
                    src={user?.avatar_url || 'https://via.placeholder.com/100'} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Status indicator */}
                <div className="absolute bottom-0 right-0 z-20 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
            </div>
            
            <div className="ml-24">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name || 'GitHub User'}</h2>
                    <div className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      Verified
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">@{user?.login || 'username'}</p>
                </div>
                
                {/* Social links - modern style */}
                <div className="flex space-x-2">
                  {user?.blog && (
                    <a 
                      href={user.blog} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300"
                      title="Website"
                    >
                      <Globe size={16} />
                    </a>
                  )}
                  {user?.email && (
                    <a 
                      href={`mailto:${user.email}`} 
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300"
                      title="Email"
                    >
                      <Mail size={16} />
                    </a>
                  )}
                  {user?.twitter_username && (
                    <a 
                      href={`https://twitter.com/${user.twitter_username}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300"
                      title="Twitter"
                    >
                      <Twitter size={16} />
                    </a>
                  )}
                  {user?.html_url && (
                    <a 
                      href={user.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300"
                      title="GitHub"
                    >
                      <Github size={16} />
                    </a>
                  )}
                  <a 
                    href="https://www.linkedin.com/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300"
                    title="LinkedIn"
                  >
                    <Linkedin size={16} />
                  </a>
                </div>
              </div>
              
              {/* Bio with styled container */}
              {user?.bio && (
                <div className="mt-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-gray-700 dark:text-gray-300 text-sm leading-relaxed relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-blue-500"></div>
                  <p className="pl-2">{user?.bio || 'No bio available'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Stats Container with Background */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-5 text-gray-800 dark:text-white">GitHub Statistics</h2>
          
          {/* First row of stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">
            <StatCard 
              title="Repositories" 
              value={stats.totalRepos} 
              icon={<GitBranch size={18} />} 
              color="blue"
              badge="Total"
            />
            <StatCard 
              title="Stars" 
              value={stats.totalStars} 
              icon={<Star size={18} />} 
              color="amber"
              badge="Earned"
            />
            <StatCard 
              title="Current Streak" 
              value={stats.currentStreak} 
              icon={<Flame size={18} />} 
              color="rose"
              subtitle="days"
              badge="Active"
            />
          </div>
          
          {/* Second row of stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <StatCard 
              title="Commits" 
              value={stats.totalCommits || stats.totalContributions} 
              icon={<GitCommit size={18} />} 
              color="green"
              badge="Activity"
            />
            <StatCard 
              title="Contributions" 
              value={stats.totalContributions} 
              icon={<Calendar size={18} />} 
              color="purple"
              badge="Impact"
            />
            <StatCard 
              title="Longest Streak" 
              value={stats.longestStreak} 
              icon={<Award size={18} />} 
              color="blue"
              subtitle="days"
              badge="Record"
            />
          </div>
        </div>
      </div>
      
      {/* Activity Graph */}
      <div className="mb-8">
        <CommitActivityGraph commitData={commitActivity} />
      </div>
      
      {/* Repository Analytics */}
      <div className="mb-8">
        <RepositoryAnalytics repositories={repositories} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Commits */}
        <div>
          <RecentCommits commits={recentCommits} />
        </div>
        
        {/* Top Repositories */}
        <div>
          <TopRepositories repositories={repositories.slice(0, 5)} />
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
