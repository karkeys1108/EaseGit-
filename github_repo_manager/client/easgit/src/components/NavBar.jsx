import React, { useState } from 'react';
import { Home, BookOpen, User, Sun, Moon, Menu, X } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';
import NotificationIcon from './Notification';
import { GitBranch } from 'lucide-react';const NavBar = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      <div 
        className={`
          fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl 
          transform transition-transform duration-300 ease-in-out z-50
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 flex justify-between items-center border-b dark:border-gray-700">
                  <GitBranch
        className={`h-8 w-8 ${isDarkMode ? 'text-white' : 'text-black'}`}
      />
          <span className="text-xl font-bold text-gray-800 dark:text-white">
            EasGit
          </span>
          <button 
            onClick={toggleMobileMenu}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 space-y-4">
          <a href="#" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
            <Home size={20} /> <span>Home</span>
          </a>
          <a href="#" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
            <BookOpen size={20} /> <span>Repo</span>
          </a>
          <div className="flex items-center space-x-4">
            <NotificationIcon />
            <User 
              className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400" 
              size={24} 
            />
          </div>
        </nav>
      </div>

      <nav className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-800 dark:text-white">
                EasGit
              </span>
            </div>

            <div className="md:hidden flex items-center">
              <button 
                onClick={toggleMobileMenu}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
              >
                <Menu size={24} />
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-4 mr-4">
                <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 flex items-center">
                  <Home size={20} className="mr-1" /> Home
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 flex items-center">
                  <BookOpen size={20} className="mr-1" /> Repo
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <NotificationIcon />
                <User 
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400" 
                  size={24} 
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <button 
        onClick={toggleDarkMode}
        className="fixed bottom-4 right-4 bg-gray-200 dark:bg-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 z-50"
      >
        {isDarkMode ? <Sun className="text-yellow-500" size={24} /> : <Moon className="text-gray-800" size={24} />}
      </button>
    </>
  );
};

export default NavBar;
