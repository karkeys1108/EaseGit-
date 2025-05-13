import React from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, Link as LinkIcon, Calendar } from 'lucide-react';

const UserProfile = ({ user }) => {
  // Format date for display
  const formatJoinDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 h-32 rounded-t-lg"></div>
      
      <div className="relative pt-16 pb-6 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {/* Avatar */}
        <div className="absolute left-6 top-0 transform -translate-y-1/2">
          <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden">
            <img 
              src={user.avatar_url} 
              alt={user.name || user.login} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* User info */}
        <div className="mt-8">
          <h1 className="text-2xl font-bold dark:text-white">{user.name || user.login}</h1>
          <p className="text-gray-600 dark:text-gray-400">@{user.login}</p>
          
          {user.bio && (
            <p className="mt-3 text-gray-700 dark:text-gray-300">{user.bio}</p>
          )}
          
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
            {user.company && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{user.company}</span>
              </div>
            )}
            
            {user.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{user.location}</span>
              </div>
            )}
            
            {user.blog && (
              <div className="flex items-center">
                <LinkIcon className="h-4 w-4 mr-1" />
                <a 
                  href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 dark:text-blue-400 hover:underline"
                >
                  {user.blog}
                </a>
              </div>
            )}
            
            {user.created_at && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Joined {formatJoinDate(user.created_at)}</span>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-4 mt-6">
            <Link 
              to="/repos" 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex-1 text-center"
            >
              Repositories
            </Link>
            <Link 
              to="/repo-wizard" 
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex-1 text-center"
            >
              New Repository
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
