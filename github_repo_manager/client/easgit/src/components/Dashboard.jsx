import React from 'react';
import { GitBranch, Star, Trophy, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import StatCard from './dashboard/StatCard';
import DailyTip from './dashboard/DailyTip';
import Leaderboard from './dashboard/Leaderboard';

const Dashboard = () => {
  const { isDark } = useTheme();
  
  const leaderboard = [
    { rank: 1, username: 'sarah_dev', commits: 342, avatar: null },
    { rank: 2, username: 'alex_coder', commits: 289, avatar: null },
    { rank: 3, username: 'mike_git', commits: 256, avatar: null },
    { rank: 4, username: 'emma_js', commits: 234, avatar: null },
    { rank: 5, username: 'chris_dev', commits: 198, avatar: null },
  ];

  const dailyTip = {
    title: "Understanding Git Commit",
    description: "A commit is like a snapshot of your project at a specific point in time. It captures the state of your files and stores a reference to that moment.",
    difficulty: "Beginner"
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero section */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                EasGit
              </span>
            </h1>
            <p className={`mt-3 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl md:max-w-3xl ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Simplify your Git workflow and contribute to open source with confidence.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={GitBranch} title="Total Repositories" value="1,234" change="+12%" />
          <StatCard icon={Users} title="Contributors" value="892" change="+5%" />
          <StatCard icon={Star} title="Stars Received" value="4.8k" change="+8%" />
          <StatCard icon={Trophy} title="Completed PRs" value="2,456" change="+15%" />
        </div>
      </div>

      {/* Main content grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daily Tip */}
          <div className="lg:col-span-2">
            <DailyTip tip={dailyTip} />
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <Leaderboard users={leaderboard} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
