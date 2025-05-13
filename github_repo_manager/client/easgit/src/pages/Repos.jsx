import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Search, GitBranch, Star, GitFork, Code, Calendar, ArrowRight, ExternalLink, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const Repos = () => {
    const { user } = useAuth();
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, sources, forks, archived
    const [sortBy, setSortBy] = useState('updated'); // updated, stars, name
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/user/repos', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                // Server returns { repositories: [...], pagination: {...} }
                setRepos(response.data.repositories || []);
            } catch (error) {
                console.error('Error fetching repos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRepos();
    }, []);

    const filteredRepos = repos
        .filter(repo => {
            // Search filter
            if (searchTerm && !repo.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
                !repo.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            
            // Type filter
            if (filter === 'sources' && repo.fork) return false;
            if (filter === 'forks' && !repo.fork) return false;
            if (filter === 'archived' && !repo.archived) return false;
            
            return true;
        })
        .sort((a, b) => {
            // Sorting
            if (sortBy === 'updated') {
                return new Date(b.updated_at) - new Date(a.updated_at);
            } else if (sortBy === 'stars') {
                return b.stargazers_count - a.stargazers_count;
            } else if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            }
            return 0;
        });

    const handleRepoClick = (repo) => {
        navigate(`/repos/${repo.owner?.login || 'user'}/${repo.name}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <motion.div 
            className="container mx-auto px-4 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold dark:text-white flex items-center">
                    <GitBranch className="h-8 w-8 mr-3 text-blue-500 dark:text-blue-400" />
                    Repositories
                </h1>
                {/* New Repository button removed as requested */}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Find a repository..."
                            className="pl-10 pr-4 py-3 w-full border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400
                                transition-all duration-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3">
                        <select
                            className="px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400
                                transition-all duration-200"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="sources">Sources</option>
                            <option value="forks">Forks</option>
                            <option value="archived">Archived</option>
                        </select>

                        <select
                            className="px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400
                                transition-all duration-200"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="updated">Last updated</option>
                            <option value="stars">Most stars</option>
                            <option value="name">Name</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredRepos.length > 0 ? (
                        filteredRepos.map(repo => (
                            <motion.div 
                                key={repo.id} 
                                className="relative overflow-hidden group rounded-lg border border-gray-100 dark:border-gray-700 
                                    transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer
                                    bg-white dark:bg-gray-800
                                    hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleRepoClick(repo)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="p-6 relative">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 flex items-center flex-wrap">
                                                <span className="truncate">{repo.name}</span>
                                                
                                                {repo.fork && (
                                                    <span className="ml-2 text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400
                                                        transition-all duration-300 group-hover:bg-gray-300 dark:group-hover:bg-gray-600">
                                                        Fork
                                                    </span>
                                                )}
                                                {repo.archived && (
                                                    <span className="ml-2 text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-full text-yellow-800 dark:text-yellow-200
                                                        transition-all duration-300 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800">
                                                        Archived
                                                    </span>
                                                )}
                                                {repo.private && (
                                                    <span className="ml-2 text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded-full text-purple-800 dark:text-purple-200
                                                        transition-all duration-300 group-hover:bg-purple-200 dark:group-hover:bg-purple-800">
                                                        Private
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-4 group-hover:text-gray-800 dark:group-hover:text-gray-300 transition-colors duration-300">
                                                {repo.description || 'No description provided'}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                {repo.language && (
                                                    <div className="flex items-center group-hover:scale-105 transition-transform duration-300">
                                                        <span className={`w-3 h-3 rounded-full mr-1 bg-${getLanguageColor(repo.language)}`}></span>
                                                        <span className="group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                                                            {repo.language}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center group-hover:scale-105 transition-transform duration-300">
                                                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                                                    <span className="group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                                                        {repo.stargazers_count}
                                                    </span>
                                                </div>
                                                <div className="flex items-center group-hover:scale-105 transition-transform duration-300">
                                                    <GitFork className="h-4 w-4 mr-1 text-blue-500" />
                                                    <span className="group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                                                        {repo.forks_count}
                                                    </span>
                                                </div>
                                                {repo.open_issues_count > 0 && (
                                                    <div className="flex items-center group-hover:scale-105 transition-transform duration-300">
                                                        <Eye className="h-4 w-4 mr-1 text-green-500" />
                                                        <span className="group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                                                            {repo.watchers_count}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center group-hover:scale-105 transition-transform duration-300">
                                                    <Calendar className="h-4 w-4 mr-1 text-purple-500" />
                                                    <span className="text-xs group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                                                        Updated {formatDate(repo.updated_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Professional action buttons */}
                                        <div className="flex flex-col gap-2 self-end md:self-start min-w-[120px]">
                                            <Link
                                                to={`/repos/${repo.owner?.login || 'user'}/${repo.name}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/repos/${repo.owner?.login || 'user'}/${repo.name}`);
                                                }}
                                                className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg
                                                    hover:bg-blue-600 transition-all duration-300 shadow-sm hover:shadow-md
                                                    hover:-translate-y-0.5"
                                            >
                                                <ArrowRight className="h-4 w-4 mr-1.5" />
                                                View Details
                                            </Link>
                                            
                                            <div className="flex gap-2">
                                                <a
                                                    href={repo.html_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex-1 flex items-center justify-center px-2 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                                                        rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 
                                                        transition-all duration-300"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                                <Link
                                                    to={`/repos/${repo.owner?.login || 'user'}/${repo.name}/commits`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex-1 flex items-center justify-center px-2 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                                                        rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 
                                                        transition-all duration-300"
                                                >
                                                    <GitBranch className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* View details arrow that appears on hover */}
                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400
                                            transform group-hover:translate-x-1 transition-transform duration-300">
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                            <div className="flex flex-col items-center">
                                <Search className="h-12 w-12 mb-4 text-gray-400 dark:text-gray-500" />
                                <h3 className="text-xl font-medium mb-2">No repositories found</h3>
                                <p>Try adjusting your search or filter criteria</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Helper functions
const getLanguageColor = (language) => {
    const colors = {
        JavaScript: 'yellow-400',
        TypeScript: 'blue-400',
        Python: 'blue-500',
        Java: 'orange-500',
        Ruby: 'red-500',
        PHP: 'indigo-400',
        CSS: 'purple-500',
        HTML: 'red-600',
        Go: 'blue-300',
        Rust: 'orange-600',
        C: 'gray-500',
        'C++': 'pink-500',
        'C#': 'green-500',
    };
    
    return colors[language] || 'gray-400';
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `on ${months[date.getMonth()]} ${date.getDate()}`;
};

export default Repos;
