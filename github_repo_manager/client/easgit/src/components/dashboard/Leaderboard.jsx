import React from 'react';
import { Trophy } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const LeaderboardCard = ({ rank, username, commits, avatar }) => {
  const { isDark } = useTheme();

  return (
    <div className={`flex items-center p-4 ${
      rank <= 3 ? isDark ? 'bg-gray-800/50' : 'bg-blue-50' : ''
    } rounded-lg`}>
      <div className={`flex-shrink-0 w-8 text-lg font-bold ${
        isDark ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {rank}
      </div>
      <div className="flex-shrink-0">
        <img
          src={avatar || `https://ui-avatars.com/api/?name=${username}&background=random`}
          alt={username}
          className="w-10 h-10 rounded-full"
        />
      </div>
      <div className="ml-4 flex-grow">
        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {username}
        </div>
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {commits} commits
        </div>
      </div>
      {rank <= 3 && (
        <Trophy className={`h-5 w-5 ${
          rank === 1 ? 'text-yellow-400' :
          rank === 2 ? 'text-gray-400' :
          'text-amber-600'
        }`} />
      )}
    </div>
  );
};

const Leaderboard = ({ users }) => {
  const { isDark } = useTheme();

  return (
    <div className={`${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    } rounded-xl shadow-sm border`}>
      <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Top Contributors
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          This week's most active developers
        </p>
      </div>
      <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
        {users.map((user) => (
          <LeaderboardCard key={user.rank} {...user} />
        ))}
      </div>
      <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <button className={`w-full text-center text-sm font-medium ${
          isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
        }`}>
          View Full Leaderboard
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;
