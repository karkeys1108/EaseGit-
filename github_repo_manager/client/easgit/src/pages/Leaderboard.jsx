import React, { useState } from 'react';
import { Trophy, GitBranch, Star, GitPullRequest, Search, Filter, Calendar } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const TimeFilter = ({ selected, onChange }) => {
  const { isDark } = useTheme();
  const options = ['Day', 'Week', 'Month', 'Year', 'All Time'];

  return (
    <div className="flex space-x-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selected === option
              ? isDark
                ? 'bg-blue-500 text-white'
                : 'bg-blue-600 text-white'
              : isDark
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

const UserCard = ({ rank, user }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`${
      isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
    } rounded-lg p-6 transition-colors border ${
      isDark ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`text-2xl font-bold ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            #{rank}
          </div>
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
            alt={user.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {user.name}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              @{user.username}
            </p>
          </div>
        </div>
        {rank <= 3 && (
          <Trophy className={`h-6 w-6 ${
            rank === 1 ? 'text-yellow-400' :
            rank === 2 ? 'text-gray-400' :
            'text-amber-600'
          }`} />
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={GitBranch} label="Repositories" value={user.repositories} />
        <Stat icon={GitPullRequest} label="Pull Requests" value={user.pullRequests} />
        <Stat icon={Star} label="Stars" value={user.stars} />
        <Stat icon={GitBranch} label="Commits" value={user.commits} />
      </div>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`flex items-center space-x-2 ${
      isDark ? 'text-gray-300' : 'text-gray-600'
    }`}>
      <Icon className="h-4 w-4" />
      <div>
        <div className="text-sm">{label}</div>
        <div className={`font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {value}
        </div>
      </div>
    </div>
  );
};

const LeaderboardPage = () => {
  const { isDark } = useTheme();
  const [timeFilter, setTimeFilter] = useState('Week');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data - replace with actual API call
  const users = [
    {
      name: 'Sarah Johnson',
      username: 'sarah_dev',
      repositories: 45,
      pullRequests: 128,
      stars: 892,
      commits: 1234,
      avatar: null
    },
    {
      name: 'Alex Chen',
      username: 'alex_coder',
      repositories: 38,
      pullRequests: 98,
      stars: 756,
      commits: 987,
      avatar: null
    },
    {
      name: 'Mike Williams',
      username: 'mike_git',
      repositories: 32,
      pullRequests: 87,
      stars: 645,
      commits: 876,
      avatar: null
    },
    // Add more users here
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className={`${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      } border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className={`text-3xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Top Contributors
          </h1>
          <p className={`mt-2 text-lg ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Recognizing our most active community members
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TimeFilter selected={timeFilter} onChange={setTimeFilter} />
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 pr-4 py-2 rounded-lg w-full md:w-64 ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>

        {/* Leaderboard Grid */}
        <div className="mt-8 grid gap-6">
          {filteredUsers.map((user, index) => (
            <UserCard
              key={user.username}
              rank={index + 1}
              user={user}
            />
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className={`text-center py-12 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            No users found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
