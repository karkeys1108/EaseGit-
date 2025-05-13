import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Filter, GitBranch, Star, GitFork, Code } from 'lucide-react';

const Repos = () => {
    const { user } = useAuth();
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, sources, forks, archived
    const [sortBy, setSortBy] = useState('updated'); // updated, stars, name

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold dark:text-white">Your Repositories</h1>
                <Link 
                    to="/repo-wizard" 
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                    New Repository
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Find a repository..."
                            className="pl-10 pr-4 py-2 w-full border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <select
                            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="sources">Sources</option>
                            <option value="forks">Forks</option>
                            <option value="archived">Archived</option>
                        </select>

                        <select
                            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="updated">Last updated</option>
                            <option value="stars">Stars</option>
                            <option value="name">Name</option>
                        </select>
                    </div>
                </div>

                <div className="divide-y dark:divide-gray-700">
                    {filteredRepos.length > 0 ? (
                        filteredRepos.map(repo => (
                            <div key={repo.id} className="py-6 first:pt-0 last:pb-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">
                                            <Link 
                                                to={`/repos/${repo.name}`} 
                                                className="text-blue-500 hover:underline dark:text-blue-400"
                                            >
                                                {repo.name}
                                            </Link>
                                            {repo.fork && (
                                                <span className="ml-2 text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                                                    Fork
                                                </span>
                                            )}
                                            {repo.archived && (
                                                <span className="ml-2 text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-full text-yellow-800 dark:text-yellow-200">
                                                    Archived
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            {repo.description || 'No description provided'}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            {repo.language && (
                                                <div className="flex items-center">
                                                    <span className={`w-3 h-3 rounded-full mr-1 bg-${getLanguageColor(repo.language)}`}></span>
                                                    {repo.language}
                                                </div>
                                            )}
                                            <div className="flex items-center">
                                                <Star className="h-4 w-4 mr-1" />
                                                {repo.stargazers_count}
                                            </div>
                                            <div className="flex items-center">
                                                <GitFork className="h-4 w-4 mr-1" />
                                                {repo.forks_count}
                                            </div>
                                            <div className="text-xs">
                                                Updated {formatDate(repo.updated_at)}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <a
                                            href={repo.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
                                        >
                                            <Code className="h-4 w-4 mr-1" />
                                            Code
                                        </a>
                                        <Link
                                            to={`/repos/${repo.owner.login}/${repo.name}/commits`}
                                            className="flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50"
                                        >
                                            <GitBranch className="h-4 w-4 mr-1" />
                                            Commits
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                            No repositories found matching your criteria
                        </div>
                    )}
                </div>
            </div>
        </div>
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
