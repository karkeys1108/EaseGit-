import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { GitBranch, Star, GitPullRequest, Users, Trophy, ArrowRight, GitFork } from 'lucide-react';
import { Link } from 'react-router-dom';

const ActivityHeatmap = ({ data }) => {
  const { isDark } = useTheme();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getColor = (count) => {
    if (count === 0) return isDark ? 'bg-gray-800' : 'bg-gray-100';
    if (count < 3) return isDark ? 'bg-blue-900/50' : 'bg-blue-100';
    if (count < 6) return isDark ? 'bg-blue-700/50' : 'bg-blue-300';
    if (count < 9) return isDark ? 'bg-blue-500/50' : 'bg-blue-500';
    return isDark ? 'bg-blue-400' : 'bg-blue-600';
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <div className="flex mb-2">
          {months.map(month => (
            <div key={month} className="flex-1 text-xs text-center text-gray-500">{month}</div>
          ))}
        </div>
        <div className="grid grid-cols-53 gap-1">
          {data.map((week, weekIndex) => (
            <div key={weekIndex} className="grid gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={"w-3 h-3 rounded-sm " + getColor(day.count) + " group relative"}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {day.count} contributions on {day.date}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, change, onClick }) => {
  const { isDark } = useTheme();
  
  return (
    <div 
      onClick={onClick}
      className={"p-6 rounded-lg border transition-all cursor-pointer transform hover:scale-105 " + 
        (isDark 
          ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50' 
          : 'bg-white border-gray-200 hover:bg-gray-50'
        )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={"text-sm font-medium " + 
            (isDark ? 'text-gray-400' : 'text-gray-600')}>
            {label}
          </p>
          <p className={"text-2xl font-semibold mt-1 " + 
            (isDark ? 'text-white' : 'text-gray-900')}>
            {value}
          </p>
        </div>
        <div className={"rounded-full p-3 " + 
          (isDark ? 'bg-gray-700' : 'bg-blue-50')}>
          <Icon className={"h-6 w-6 " + 
            (isDark ? 'text-blue-400' : 'text-blue-600')} />
        </div>
      </div>
      {change && (
        <div className="mt-2">
          <span className={"text-sm font-medium " + 
            (change >= 0 ? 'text-green-500' : 'text-red-500')}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          <span className={"ml-2 text-sm " + 
            (isDark ? 'text-gray-400' : 'text-gray-600')}>
            from last month
          </span>
        </div>
      )}
    </div>
  );
};

const RankCard = ({ rank, total }) => {
  const { isDark } = useTheme();
  const percentage = (rank / total) * 100;
  
  return (
    <div className={"p-6 rounded-lg border " + 
      (isDark 
        ? 'bg-gray-800/50 border-gray-700' 
        : 'bg-white border-gray-200'
      )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={"text-lg font-semibold " + 
          (isDark ? 'text-white' : 'text-gray-900')}>
          Your Rank
        </h3>
        <Trophy className={"h-6 w-6 " + 
          (isDark ? 'text-yellow-500' : 'text-yellow-600')} />
      </div>
      <div className="flex items-end space-x-2">
        <span className={"text-3xl font-bold " + 
          (isDark ? 'text-white' : 'text-gray-900')}>
          #{rank}
        </span>
        <span className={"text-sm mb-1 " + 
          (isDark ? 'text-gray-400' : 'text-gray-600')}>
          of {total} users
        </span>
      </div>
      <div className="mt-4">
        <div className="relative pt-1">
          <div className={"overflow-hidden h-2 text-xs flex rounded " + 
            (isDark ? 'bg-gray-700' : 'bg-gray-200')}>
            <div
              style={{ width: `${100 - percentage}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
            ></div>
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <span className={"text-xs font-medium " + 
            (isDark ? 'text-gray-400' : 'text-gray-600')}>
            Top {percentage.toFixed(1)}%
          </span>
          <Link
            to="/leaderboard"
            className={"text-xs font-medium flex items-center " + 
              (isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500')}>
            View Leaderboard
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { isDark } = useTheme();
  
  // Mock data - replace with actual API data
  const activityData = Array(53).fill().map(() => 
    Array(7).fill().map(() => ({
      count: Math.floor(Math.random() * 12),
      date: '2025-05-12'
    }))
  );

  const stats = {
    commits: { value: 1234, change: 12 },
    stars: { value: 567, change: -5 },
    prs: { value: 89, change: 8 },
    repos: { value: 45, change: 0 },
    rank: { current: 123, total: 10000 }
  };

  return (
    <div className={isDark ? 'min-h-screen bg-gray-900' : 'min-h-screen bg-gray-50'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 mb-8 md:grid-cols-4">
          <StatCard
            icon={GitBranch}
            label="Total Commits"
            value={stats.commits.value}
            change={stats.commits.change}
          />
          <StatCard
            icon={Star}
            label="Stars Received"
            value={stats.stars.value}
            change={stats.stars.change}
          />
          <StatCard
            icon={GitPullRequest}
            label="Pull Requests"
            value={stats.prs.value}
            change={stats.prs.change}
          />
          <StatCard
            icon={GitFork}
            label="Repositories"
            value={stats.repos.value}
            change={stats.repos.change}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className={"md:col-span-2 p-6 rounded-lg border " + 
            (isDark 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-white border-gray-200')}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={"text-lg font-semibold " + 
                (isDark ? 'text-white' : 'text-gray-900')}>
                Contribution Activity
              </h3>
              <select className={"px-3 py-1 rounded-lg text-sm border " + 
                (isDark 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-gray-50 border-gray-200 text-gray-700')}>
                <option>Last Year</option>
                <option>Last 6 Months</option>
                <option>Last Month</option>
              </select>
            </div>
            <ActivityHeatmap data={activityData} />
          </div>
          <RankCard rank={stats.rank.current} total={stats.rank.total} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
