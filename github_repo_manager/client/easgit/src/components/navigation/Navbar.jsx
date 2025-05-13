import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GitBranch, Trophy, Book, Wand, Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../common/ThemeToggle';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: GitBranch },
  { name: 'Repo Wizard', path: '/repo-wizard', icon: Wand },
  { name: 'Learn Git', path: '/learn-git', icon: Book },
  { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
];

const Navbar = () => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? isDark
            ? 'bg-gray-900/95 border-gray-800 shadow-lg backdrop-blur-sm'
            : 'bg-white/95 border-gray-200 shadow-lg backdrop-blur-sm'
          : isDark
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200'
      } border-b`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-3 group"
              onClick={() => setIsOpen(false)}
            >
              <div className={`p-2 rounded-lg transition-all duration-200 ${
                isDark
                  ? 'bg-blue-500/10 group-hover:bg-blue-500/20'
                  : 'bg-blue-50 group-hover:bg-blue-100'
              }`}>
                <GitBranch className={`h-6 w-6 transition-colors ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <span className="text-2xl font-bold font-shareTech bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                EasGit
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map(({ name, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`group flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(path)
                    ? isDark
                      ? 'bg-gray-800 text-blue-400'
                      : 'bg-blue-50 text-blue-600'
                    : isDark
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 mr-2 transition-transform group-hover:scale-110 ${
                  isActive(path) ? 'transform rotate-3' : ''
                }`} />
                {name}
              </Link>
            ))}
            <div className="ml-4 flex items-center border-l pl-4 border-gray-200 dark:border-gray-700">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`ml-4 inline-flex items-center justify-center p-2 rounded-lg ${
                isDark
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        } overflow-hidden`}
      >
        <div className={`px-2 pt-2 pb-3 space-y-1 border-t ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        }`}>
          {navItems.map(({ name, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center px-3 py-2 rounded-lg text-base font-medium ${
                isActive(path)
                  ? isDark
                    ? 'bg-gray-800 text-blue-400'
                    : 'bg-blue-50 text-blue-600'
                  : isDark
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
