import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  Github, 
  Twitter, 
  Globe, 
  Mail, 
  Linkedin,
  Award,
  Shield,
  Sparkles
} from 'lucide-react';

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
    <div className="relative overflow-hidden group">
      {/* Premium background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 h-40 rounded-t-xl shadow-lg">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-500/30 animate-gradient-x"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute top-0 left-5 w-20 h-20 rounded-full bg-white/20 blur-xl"></div>
          <div className="absolute bottom-5 right-10 w-16 h-16 rounded-full bg-pink-300/30 blur-xl"></div>
          <div className="absolute top-10 right-20 w-12 h-12 rounded-full bg-blue-300/30 blur-xl"></div>
        </div>
        
        {/* Premium badge */}
        <div className="absolute top-0 right-0">
          <div className="bg-amber-500 text-white px-3 py-1 rounded-bl-lg rounded-tr-xl text-xs font-semibold uppercase tracking-wider shadow-lg flex items-center">
            <Award size={14} className="mr-1" />
            Premium
          </div>
        </div>
      </div>
      
      <div className="relative pt-28 pb-6 px-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-purple-500/10">
        {/* Avatar with glow effect */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-0">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur-md opacity-70 scale-110 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Avatar */}
            <div className="relative w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden z-10">
              <img 
                src={user?.avatar_url || 'https://via.placeholder.com/100'} 
                alt={user?.name || user?.login || 'User'} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Status indicator */}
            <div className="absolute bottom-1 right-1 z-20 bg-green-500 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>
        </div>
        
        {/* User info - centered layout */}
        <div className="mt-14 text-center">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300">
              {user?.name || user?.login || 'GitHub User'}
            </h1>
            
            <div className="flex items-center mt-1">
              <p className="text-gray-600 dark:text-gray-400">@{user?.login || 'username'}</p>
              {user?.location && (
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm ml-2">
                  <span className="mx-1">•</span>
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>
            
            {/* Verification badge */}
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              <Shield className="w-3 h-3 mr-1" />
              Verified Developer
            </div>
          </div>
          
          {/* Bio with styled container */}
          {user?.bio && (
            <div className="mt-4 px-4 py-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-gray-700 dark:text-gray-300 text-sm leading-relaxed relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500"></div>
              <Sparkles className="absolute top-2 right-2 h-4 w-4 text-purple-400 opacity-50" />
              <p className="italic">{user.bio}</p>
            </div>
          )}
          
          {/* Social media links - modern style */}
          <div className="mt-6 flex justify-center space-x-3">
            {user?.html_url && (
              <a 
                href={user.html_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                title="GitHub Profile"
              >
                <Github size={18} />
              </a>
            )}
            
            {user?.blog && (
              <a 
                href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                title="Website"
              >
                <Globe size={18} />
              </a>
            )}
            
            {user?.twitter_username && (
              <a 
                href={`https://twitter.com/${user.twitter_username}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                title="Twitter"
              >
                <Twitter size={18} />
              </a>
            )}
            
            {user?.email && (
              <a 
                href={`mailto:${user.email}`}
                className="group flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                title="Email"
              >
                <Mail size={18} />
              </a>
            )}
            
            <a 
              href="https://www.linkedin.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
              title="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
          </div>
          
          {/* Joined date with subtle styling */}
          {user?.created_at && (
            <div className="mt-5 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Joined {formatJoinDate(user.created_at)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
