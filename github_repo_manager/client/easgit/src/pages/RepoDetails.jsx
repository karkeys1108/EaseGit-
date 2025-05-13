import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  GitBranch, Star, GitFork, Eye, ExternalLink, 
  GitPullRequest, AlertCircle, Code, Clock, Calendar,
  ChevronDown, ChevronRight
} from 'lucide-react';

const RepoDetails = () => {
  const { owner, repo } = useParams();
  const [repoDetails, setRepoDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [pullRequests, setPullRequests] = useState([]);
  const [issues, setIssues] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingPRs, setLoadingPRs] = useState(false);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Fetch repository details
  useEffect(() => {
    const fetchRepoDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/repos/${owner}/${repo}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRepoDetails(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching repository details:', err);
        setError('Failed to load repository details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRepoDetails();
  }, [owner, repo]);

  // Fetch data based on active tab
  useEffect(() => {
    if (!repoDetails) return;

    const fetchTabData = async () => {
      const token = localStorage.getItem('token');
      
      if (activeTab === 'pull-requests' && pullRequests.length === 0) {
        setLoadingPRs(true);
        try {
          const response = await axios.get(`http://localhost:5000/api/repos/${owner}/${repo}/pulls`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setPullRequests(response.data);
        } catch (err) {
          console.error('Error fetching pull requests:', err);
        } finally {
          setLoadingPRs(false);
        }
      }
      
      if (activeTab === 'issues' && issues.length === 0) {
        setLoadingIssues(true);
        try {
          const response = await axios.get(`http://localhost:5000/api/repos/${owner}/${repo}/issues`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setIssues(response.data);
        } catch (err) {
          console.error('Error fetching issues:', err);
        } finally {
          setLoadingIssues(false);
        }
      }
      
      if (activeTab === 'branches' && branches.length === 0) {
        setLoadingBranches(true);
        try {
          const response = await axios.get(`http://localhost:5000/api/repos/${owner}/${repo}/branches`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setBranches(response.data);
        } catch (err) {
          console.error('Error fetching branches:', err);
        } finally {
          setLoadingBranches(false);
        }
      }
    };

    fetchTabData();
  }, [activeTab, repoDetails, owner, repo, pullRequests.length, issues.length, branches.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md backdrop-filter rounded-lg shadow-lg p-6 border border-white/20 dark:border-gray-700/50">
          <div className="flex items-center mb-4">
            <Link to="/repos" className="text-blue-500 hover:text-blue-600 mr-4">
              ← Back to Repositories
            </Link>
          </div>
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Error Loading Repository</h2>
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Repository Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md backdrop-filter rounded-lg shadow-lg p-6 mb-6 border border-white/20 dark:border-gray-700/50">
        <div className="flex items-center mb-4">
          <Link to="/repos" className="flex items-center text-blue-500 hover:text-blue-600 mr-4">
            ← Back to Repositories
          </Link>
        </div>
        
        {repoDetails && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold dark:text-white mb-2 flex items-center">
                  {owner}/{repo}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {repoDetails.description || 'No description provided'}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {repoDetails.language && (
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: getLanguageColor(repoDetails.language) }}></span>
                      {repoDetails.language}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    {repoDetails.stargazers_count} stars
                  </div>
                  <div className="flex items-center">
                    <GitFork className="h-4 w-4 mr-1 text-blue-500" />
                    {repoDetails.forks_count} forks
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1 text-purple-500" />
                    {repoDetails.watchers_count} watchers
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    Updated {formatDate(repoDetails.updated_at)}
                  </div>
                </div>
              </div>
              <a 
                href={repoDetails.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on GitHub
              </a>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8">
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  <Code className="h-4 w-4 inline mr-1" />
                  Overview
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pull-requests'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('pull-requests')}
                >
                  <GitPullRequest className="h-4 w-4 inline mr-1" />
                  Pull Requests
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'issues'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('issues')}
                >
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  Issues
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'branches'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('branches')}
                >
                  <GitBranch className="h-4 w-4 inline mr-1" />
                  Branches
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'commits'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('commits')}
                >
                  <Code className="h-4 w-4 inline mr-1" />
                  Commits
                </button>
              </nav>
            </div>
          </>
        )}
      </div>
      
      {/* Tab Content */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md backdrop-filter rounded-lg shadow-lg p-6 border border-white/20 dark:border-gray-700/50">
        {activeTab === 'overview' && <OverviewTab repoDetails={repoDetails} owner={owner} repo={repo} />}
        {activeTab === 'pull-requests' && <PullRequestsTab pullRequests={pullRequests} loading={loadingPRs} />}
        {activeTab === 'issues' && <IssuesTab issues={issues} loading={loadingIssues} />}
        {activeTab === 'branches' && <BranchesTab branches={branches} loading={loadingBranches} />}
        {activeTab === 'commits' && <CommitsTab owner={owner} repo={repo} />}
      </div>
    </div>
  );
};

// Tab Components
const OverviewTab = ({ repoDetails, owner, repo }) => {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCommits = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/repos/${owner}/${repo}/commits`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCommits(response.data.slice(0, 5)); // Get the 5 most recent commits
      } catch (error) {
        console.error('Error fetching commits:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCommits();
  }, [owner, repo]);
  
  return (
    <div>
      <h3 className="text-xl font-semibold dark:text-white mb-6">Repository Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-medium dark:text-white mb-4">Recent Commits</h4>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : commits.length > 0 ? (
            <div className="space-y-4">
              {commits.map((commit, index) => (
                <div 
                  key={commit.sha || index} 
                  className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100/50 dark:border-gray-600/50 backdrop-blur-sm"
                >
                  <div className="flex items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-800 dark:text-white truncate">
                        {commit.commit?.message || 'No message'}
                      </h3>
                      <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(commit.commit?.author?.date || Date.now()).toLocaleDateString()}
                        <span className="mx-1">•</span>
                        {commit.author?.login || commit.commit?.author?.name || 'Unknown author'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No commits found for this repository
            </div>
          )}
        </div>
        
        <div>
          <h4 className="text-lg font-medium dark:text-white mb-4">Repository Info</h4>
          <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100/50 dark:border-gray-600/50 backdrop-blur-sm">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Default Branch</p>
                <p className="font-medium dark:text-white">{repoDetails?.default_branch || 'main'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                <p className="font-medium dark:text-white">{formatDate(repoDetails?.created_at, true)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Push</p>
                <p className="font-medium dark:text-white">{formatDate(repoDetails?.pushed_at, true)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">License</p>
                <p className="font-medium dark:text-white">{repoDetails?.license?.name || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Size</p>
                <p className="font-medium dark:text-white">{formatSize(repoDetails?.size)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommitsTab = ({ owner, repo }) => {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCommits, setExpandedCommits] = useState({});
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'network'
  const networkContainerRef = useRef(null);
  const [networkDimensions, setNetworkDimensions] = useState({ width: 0, height: 0 });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [hoveredCommit, setHoveredCommit] = useState(null);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/repos/${owner}/${repo}/commits`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCommits(response.data); // Get all commits
      } catch (error) {
        console.error('Error fetching commits:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCommits();
  }, [owner, repo]);

  // Update network dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (networkContainerRef.current) {
        setNetworkDimensions({
          width: networkContainerRef.current.offsetWidth,
          height: 600
        });
      }
    };
    
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, [viewMode]);

  const toggleCommitExpand = (sha) => {
    setExpandedCommits(prev => ({
      ...prev,
      [sha]: !prev[sha]
    }));
  };

  // Group commits by date
  const commitsByDate = commits.reduce((acc, commit) => {
    const date = new Date(commit.commit?.author?.date || Date.now()).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(commit);
    return acc;
  }, {});

  // Render network visualization
  const renderNetworkVisualization = () => {
    if (commits.length === 0) return null;
    
    // Create a simplified commit graph with improved layout
    const commitNodes = commits.map((commit, index) => {
      // Calculate position based on commit date for more realistic timeline
      const commitDate = new Date(commit.commit?.author?.date || Date.now());
      const timeOffset = Date.now() - commitDate.getTime();
      
      // Create a more visually interesting curved layout
      const angle = (index / commits.length) * Math.PI * 1.5;
      const radius = 180;
      const x = networkDimensions.width / 2 + Math.cos(angle) * radius;
      const y = 250 + Math.sin(angle) * radius;
      
      return { 
        commit, 
        x, 
        y,
        index,
        date: commitDate
      };
    });
    
    // Sort nodes by date for proper connections
    commitNodes.sort((a, b) => a.date - b.date);
    
    // Handle mouse events for panning
    const handleMouseDown = (e) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseMove = (e) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        
        setPan(prevPan => ({
          x: prevPan.x + dx,
          y: prevPan.y + dy
        }));
        
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    // Handle wheel events for zooming
    const handleWheel = (e) => {
      e.preventDefault();
      const newZoom = zoom - e.deltaY * 0.001;
      setZoom(Math.max(0.5, Math.min(2, newZoom)));
    };
    
    return (
      <div className="relative">
        <div 
          className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-gray-800/80 dark:to-gray-900/80 rounded-lg border border-blue-100/50 dark:border-indigo-900/30 backdrop-blur-sm overflow-hidden shadow-lg"
          ref={networkContainerRef}
          style={{ height: '600px', width: '100%', position: 'relative' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Background grid pattern */}
          <div 
            className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzlmYTZiNyIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"
            style={{ opacity: 0.5 }}
          ></div>
          
          <defs>
            {/* Multiple gradient options for connection lines */}
            <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
            </linearGradient>
            
            <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
            </linearGradient>
            
            <linearGradient id="lineGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.8" />
            </linearGradient>
            
            {/* Multiple gradients for nodes based on age/importance */}
            <radialGradient id="nodeGradient1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#3B82F6" />
            </radialGradient>
            
            <radialGradient id="nodeGradient2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#10B981" />
            </radialGradient>
            
            <radialGradient id="nodeGradient3" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
            
            <radialGradient id="nodeGradient4" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#F87171" />
              <stop offset="100%" stopColor="#EF4444" />
            </radialGradient>
            
            <radialGradient id="nodeGradient5" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </radialGradient>
            
            {/* Enhanced highlight gradients */}
            <radialGradient id="highlightGradient1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="100%" stopColor="#2563EB" />
            </radialGradient>
            
            <radialGradient id="highlightGradient2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="100%" stopColor="#059669" />
            </radialGradient>
            
            <radialGradient id="highlightGradient3" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>
            
            <radialGradient id="highlightGradient4" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#FCA5A5" />
              <stop offset="100%" stopColor="#DC2626" />
            </radialGradient>
            
            <radialGradient id="highlightGradient5" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#DDD6FE" />
              <stop offset="100%" stopColor="#7C3AED" />
            </radialGradient>
            
            {/* Glow filter */}
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            {/* Shadow filter */}
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
            </filter>
            
            {/* Avatar clip path */}
            <clipPath id="avatarClip">
              <circle cx="10" cy="0" r="10" />
            </clipPath>
          </defs>
          
          <div className="absolute top-4 right-4 flex space-x-2 z-10">
            <button 
              onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
              className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-md shadow-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-blue-600 dark:text-blue-400"
            >
              <span className="text-lg font-bold">+</span>
            </button>
            <button 
              onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
              className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-md shadow-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-blue-600 dark:text-blue-400"
            >
              <span className="text-lg font-bold">-</span>
            </button>
            <button 
              onClick={() => {
                setPan({ x: 0, y: 0 });
                setZoom(1);
              }}
              className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-md shadow-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-blue-600 dark:text-blue-400 text-xs"
            >
              Reset
            </button>
          </div>
          
          <svg 
            width="100%" 
            height="100%" 
            style={{ 
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center',
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            <g>
              {/* Center point marker */}
              <circle 
                cx={networkDimensions.width / 2} 
                cy={250} 
                r="8" 
                fill="url(#lineGradient1)" 
                opacity="0.7"
              />
              
              {/* Connect all nodes to central hub */}
              {commitNodes.map((node) => {
                const colorIndex = node.index % 5;
                const lineGradient = colorIndex === 0 ? "url(#lineGradient1)" : 
                                    colorIndex === 1 ? "url(#lineGradient2)" : 
                                    "url(#lineGradient3)";
                
                return (
                  <line 
                    key={`hub-line-${node.commit.sha}`}
                    x1={node.x}
                    y1={node.y}
                    x2={networkDimensions.width / 2}
                    y2={250}
                    stroke={lineGradient}
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                    opacity={hoveredCommit === node.commit.sha ? "0.8" : "0.4"}
                    className="transition-all duration-300 ease-in-out"
                  />
                );
              })}
              
              {/* Sequential connections between commits */}
              {commitNodes.map((node, index) => {
                if (index === 0) return null;
                
                const prevNode = commitNodes[index - 1];
                const path = `M ${prevNode.x} ${prevNode.y} Q ${networkDimensions.width / 2} ${250}, ${node.x} ${node.y}`;
                
                const lineGradient = index % 3 === 0 ? "url(#lineGradient1)" : 
                                    index % 3 === 1 ? "url(#lineGradient2)" : 
                                    "url(#lineGradient3)";
                
                return (
                  <path 
                    key={`line-${node.commit.sha}`}
                    d={path}
                    stroke={lineGradient}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    fill="none"
                    opacity={hoveredCommit === node.commit.sha || hoveredCommit === prevNode.commit.sha ? "0.9" : "0.6"}
                    className="transition-all duration-300 ease-in-out"
                  />
                );
              })}
              
              {/* Add connections between all nodes for a complete network */}
              {commitNodes.map((node, i) => {
                return commitNodes.map((targetNode, j) => {
                  // Skip self-connections, sequential connections (already drawn), and only connect each pair once
                  if (i >= j || Math.abs(i - j) === 1) return null;
                  
                  // Connect all nodes regardless of distance
                  const colorIndex = (i + j) % 5;
                  const lineGradient = colorIndex === 0 ? "url(#lineGradient1)" : 
                                      colorIndex === 1 ? "url(#lineGradient2)" : 
                                      "url(#lineGradient3)";
                  
                  // Calculate distance for opacity - farther nodes have more transparent connections
                  const distance = Math.abs(i - j);
                  const opacity = Math.max(0.1, 0.5 - (distance * 0.05));
                  
                  return (
                    <path
                      key={`network-line-${node.commit.sha}-${targetNode.commit.sha}`}
                      d={`M ${node.x} ${node.y} Q ${(node.x + targetNode.x) / 2} ${(node.y + targetNode.y) / 2 + 30}, ${targetNode.x} ${targetNode.y}`}
                      stroke={lineGradient}
                      strokeWidth="1"
                      strokeDasharray="2,2"
                      fill="none"
                      opacity={opacity}
                      className="transition-all duration-300 ease-in-out"
                    />
                  );
                });
              })}
              
              {/* Draw commit nodes */}
              {commitNodes.map((node, index) => {
                const isHovered = hoveredCommit === node.commit.sha;
                const nodeSize = isHovered ? 24 : 20;
                
                // Determine node color based on index
                const colorIndex = index % 5;
                const nodeGradient = `url(#nodeGradient${colorIndex + 1})`;
                const highlightGradient = `url(#highlightGradient${colorIndex + 1})`;
                
                return (
                  <g 
                    key={node.commit.sha}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer"
                    onClick={() => toggleCommitExpand(node.commit.sha)}
                    onMouseEnter={() => setHoveredCommit(node.commit.sha)}
                    onMouseLeave={() => setHoveredCommit(null)}
                  >
                    {/* Node shadow - always present */}
                    <circle 
                      r={nodeSize + 3}
                      fill="rgba(0,0,0,0.2)"
                      opacity="0.6"
                      transform="translate(2,2)"
                      className="transition-all duration-300 ease-in-out"
                    />
                    
                    {/* Outer glow ring - only visible on hover */}
                    {isHovered && (
                      <circle
                        r={nodeSize + 8}
                        fill="none"
                        stroke={colorIndex === 0 ? "#3B82F6" : 
                                colorIndex === 1 ? "#10B981" : 
                                colorIndex === 2 ? "#F59E0B" : 
                                colorIndex === 3 ? "#EF4444" : 
                                "#8B5CF6"}
                        strokeWidth="2"
                        strokeOpacity="0.4"
                        className="animate-pulse"
                      />
                    )}
                    
                    {/* Node circle with stroke for better definition */}
                    <circle 
                      r={nodeSize}
                      fill={isHovered ? highlightGradient : nodeGradient}
                      stroke={colorIndex === 0 ? "#2563EB" : 
                              colorIndex === 1 ? "#059669" : 
                              colorIndex === 2 ? "#D97706" : 
                              colorIndex === 3 ? "#DC2626" : 
                              "#7C3AED"}
                      strokeWidth="1.5"
                      className="transition-all duration-300 ease-in-out"
                    />
                    
                    {/* Node text */}
                    <text
                      fill="white"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fontWeight="bold"
                      className="select-none pointer-events-none"
                      style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.3)" }}
                    >
                      {index + 1}
                    </text>
                    
                    {/* Date label with background for better readability */}
                    <g transform={`translate(0, ${nodeSize + 18})`}>
                      <rect
                        x="-30"
                        y="-8"
                        width="60"
                        height="16"
                        rx="4"
                        fill="white"
                        fillOpacity="0.7"
                        className="dark:fill-gray-800/70"
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="10"
                        fill="#374151"
                        className="dark:fill-gray-200"
                      >
                        {node.date.toLocaleDateString()}
                      </text>
                    </g>
                    
                    {/* Commit info on hover */}
                    {isHovered && (
                      <g 
                        className="transition-opacity duration-300 ease-in-out"
                        style={{ opacity: 1 }}
                      >
                        <rect
                          x="30"
                          y="-50"
                          width="240"
                          height="100"
                          rx="6"
                          fill="white"
                          fillOpacity="0.98"
                          stroke="#E2E8F0"
                          className="dark:fill-gray-800 dark:stroke-gray-700"
                          filter="drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))"
                        />
                        
                        {/* Commit message */}
                        <text
                          x="45"
                          y="-25"
                          fontSize="13"
                          fontWeight="bold"
                          fill="#1E293B"
                          className="dark:fill-white"
                        >
                          {node.commit.commit?.message.split('\n')[0].substring(0, 30)}
                          {node.commit.commit?.message.split('\n')[0].length > 30 ? '...' : ''}
                        </text>
                        
                        {/* Author info with avatar */}
                        <g transform="translate(45, 0)">
                          <circle
                            cx="10"
                            cy="0"
                            r="10"
                            fill="#E2E8F0"
                            className="dark:fill-gray-700"
                          />
                          {node.commit.author?.avatar_url && (
                            <image
                              href={node.commit.author.avatar_url}
                              x="0"
                              y="-10"
                              height="20"
                              width="20"
                              preserveAspectRatio="xMidYMid slice"
                              clipPath="url(#avatarClip)"
                            />
                          )}
                          <text
                            x="30"
                            y="0"
                            fontSize="12"
                            fill="#475569"
                            dominantBaseline="middle"
                            className="dark:fill-gray-300"
                          >
                            {node.commit.author?.login || node.commit.commit?.author?.name || 'Unknown author'}
                          </text>
                        </g>
                        
                        {/* Commit details */}
                        <g transform="translate(45, 25)">
                          <text
                            fontSize="11"
                            fill="#64748B"
                            className="dark:fill-gray-400"
                          >
                            <tspan x="0" y="0">SHA: {node.commit.sha.substring(0, 7)}</tspan>
                            <tspan x="0" y="18">Date: {node.date.toLocaleString()}</tspan>
                          </text>
                        </g>
                        
                        {/* View button */}
                        <g transform="translate(210, 20)">
                          <a 
                            href={node.commit.html_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <rect
                              x="-15"
                              y="-15"
                              width="30"
                              height="30"
                              rx="15"
                              fill="#EFF6FF"
                              className="dark:fill-blue-900/30"
                            />
                            <text
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="14"
                              fill="#3B82F6"
                              className="dark:fill-blue-400"
                            >
                              ↗
                            </text>
                          </a>
                        </g>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-gray-800/80 rounded-md p-3 shadow-md backdrop-blur-sm">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Commit Network</h4>
            <div className="grid grid-cols-1 gap-1">
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span>Recent commits</span>
              </div>
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span>Feature commits</span>
              </div>
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                <span>Bugfix commits</span>
              </div>
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span>Important commits</span>
              </div>
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                <span>Documentation commits</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg border border-blue-100/50 dark:border-indigo-900/30 backdrop-blur-sm shadow-md">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interaction Tips:</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span> Click on a node to expand/collapse commit details</li>
            <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span> Drag the canvas to pan around</li>
            <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span> Use mouse wheel to zoom in/out</li>
            <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span> Hover over nodes to see commit details</li>
          </ul>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold dark:text-white">Commit History</h3>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'timeline' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Timeline View
          </button>
          <button 
            onClick={() => setViewMode('network')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'network' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Network View
          </button>
        </div>
      </div>
      
      {commits.length > 0 ? (
        viewMode === 'timeline' ? (
          <div className="commit-timeline relative">
            {/* Timeline line */}
            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400"></div>
            
            {Object.entries(commitsByDate).map(([date, dateCommits], dateIndex) => (
              <div key={date} className="mb-8 last:mb-0">
                {/* Date header */}
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 z-10">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white">{date}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{dateCommits.length} commit{dateCommits.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                
                {/* Commits for this date */}
                <div className="space-y-4 ml-7 pl-10 relative">
                  {dateCommits.map((commit, index) => {
                    const isExpanded = expandedCommits[commit.sha];
                    
                    return (
                      <div 
                        key={commit.sha} 
                        className={`bg-white/50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100/50 dark:border-gray-600/50 backdrop-blur-sm transition-all hover:shadow-md ${
                          isExpanded ? 'bg-white/80 dark:bg-gray-700/80' : 'hover:bg-white/80 dark:hover:bg-gray-700/80'
                        }`}
                      >
                        {/* Commit dot */}
                        <div className="absolute left-0 w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 transform -translate-x-1.5 mt-4"></div>
                        
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3">
                            <img 
                              src={commit.author?.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'} 
                              alt={commit.author?.login || 'Avatar'} 
                              className="w-10 h-10 rounded-full"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h3 
                                className="text-md font-medium text-gray-800 dark:text-white break-words cursor-pointer"
                                onClick={() => toggleCommitExpand(commit.sha)}
                              >
                                {commit.commit?.message.split('\n')[0] || 'No message'}
                              </h3>
                              <div className="flex items-center ml-2">
                                <button
                                  onClick={() => toggleCommitExpand(commit.sha)}
                                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mr-1"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                                <a 
                                  href={commit.html_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </div>
                            </div>
                            
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center">
                                <Code className="h-4 w-4 mr-1" />
                                <span className="font-mono">{commit.sha.substring(0, 7)}</span>
                              </div>
                              
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {new Date(commit.commit?.author?.date).toLocaleTimeString()}
                              </div>
                              
                              <div>
                                by {commit.author?.login || commit.commit?.author?.name || 'Unknown author'}
                              </div>
                            </div>
                            
                            {/* Expanded content */}
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600 animate-fadeIn">
                                {commit.commit?.message.includes('\n') && (
                                  <div className="mb-3">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Commit Message</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                                      {commit.commit.message}
                                    </p>
                                  </div>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Commit Details</h4>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="text-gray-500 dark:text-gray-400">SHA</div>
                                        <div className="font-mono text-gray-700 dark:text-gray-300">{commit.sha}</div>
                                        
                                        <div className="text-gray-500 dark:text-gray-400">Author</div>
                                        <div className="text-gray-700 dark:text-gray-300">{commit.commit?.author?.name}</div>
                                        
                                        <div className="text-gray-500 dark:text-gray-400">Date</div>
                                        <div className="text-gray-700 dark:text-gray-300">
                                          {new Date(commit.commit?.author?.date).toLocaleString()}
                                        </div>
                                        
                                        {commit.stats && (
                                          <>
                                            <div className="text-gray-500 dark:text-gray-400">Changes</div>
                                            <div className="text-gray-700 dark:text-gray-300">
                                              <span className="text-green-600 dark:text-green-400">+{commit.stats.additions}</span>
                                              <span className="mx-1 text-gray-400">/</span>
                                              <span className="text-red-600 dark:text-red-400">-{commit.stats.deletions}</span>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {commit.files && commit.files.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Files Changed ({commit.files.length})
                                      </h4>
                                      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md max-h-40 overflow-y-auto">
                                        <ul className="space-y-1 text-sm">
                                          {commit.files.map(file => (
                                            <li key={file.filename} className="truncate">
                                              <span className={`inline-block w-5 text-center ${
                                                file.status === 'added' ? 'text-green-600 dark:text-green-400' :
                                                file.status === 'removed' ? 'text-red-600 dark:text-red-400' :
                                                'text-yellow-600 dark:text-yellow-400'
                                              }`}>
                                                {file.status === 'added' ? 'A' : 
                                                 file.status === 'removed' ? 'D' : 'M'}
                                              </span>
                                              <span className="text-gray-700 dark:text-gray-300 ml-1">{file.filename}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Network view
          renderNetworkVisualization()
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <Code className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">No commits found</h3>
          <p className="text-gray-500 dark:text-gray-400">This repository doesn't have any commits yet.</p>
        </div>
      )}
    </div>
  );
};

const PullRequestsTab = ({ pullRequests, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="text-xl font-semibold dark:text-white mb-6">Pull Requests</h3>
      
      {pullRequests.length > 0 ? (
        <div className="space-y-4">
          {pullRequests.map(pr => (
            <div 
              key={pr.id} 
              className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100/50 dark:border-gray-600/50 backdrop-blur-sm"
            >
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-purple-100/50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-3 mt-1 flex-shrink-0">
                  <GitPullRequest className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-md font-medium text-gray-800 dark:text-white">
                    <a 
                      href={pr.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-500 dark:hover:text-blue-400"
                    >
                      {pr.title}
                    </a>
                  </h3>
                  
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <div>
                      #{pr.number} opened by {pr.user.login}
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(pr.created_at)}
                    </div>
                    
                    <div className={`px-2 py-0.5 rounded-full text-xs ${
                      pr.state === 'open' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {pr.state}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <GitPullRequest className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">No pull requests found</h3>
          <p className="text-gray-500 dark:text-gray-400">This repository doesn't have any pull requests yet.</p>
        </div>
      )}
    </div>
  );
};

const IssuesTab = ({ issues, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="text-xl font-semibold dark:text-white mb-6">Issues</h3>
      
      {issues.length > 0 ? (
        <div className="space-y-4">
          {issues.map(issue => (
            <div 
              key={issue.id} 
              className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100/50 dark:border-gray-600/50 backdrop-blur-sm"
            >
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-400 mr-3 mt-1 flex-shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-md font-medium text-gray-800 dark:text-white">
                    <a 
                      href={issue.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-500 dark:hover:text-blue-400"
                    >
                      {issue.title}
                    </a>
                  </h3>
                  
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <div>
                      #{issue.number} opened by {issue.user.login}
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(issue.created_at)}
                    </div>
                    
                    <div className={`px-2 py-0.5 rounded-full text-xs ${
                      issue.state === 'open' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {issue.state}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">No issues found</h3>
          <p className="text-gray-500 dark:text-gray-400">This repository doesn't have any issues yet.</p>
        </div>
      )}
    </div>
  );
};

const BranchesTab = ({ branches, loading }) => {
  const [branchTree, setBranchTree] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  
  // Update canvas size on resize
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.offsetWidth,
          height: 600
        });
      }
    };
    
    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);
  
  // Transform branch data into tree format
  useEffect(() => {
    if (branches.length > 0) {
      // Find the default branch (usually main or master)
      const defaultBranch = branches.find(branch => 
        branch.name === 'main' || branch.name === 'master'
      ) || branches[0];
      
      // Create a map of branches by name for easy lookup
      const branchMap = branches.reduce((acc, branch) => {
        acc[branch.name] = {
          ...branch,
          children: [],
          x: 0,
          y: 0,
          expanded: true
        };
        return acc;
      }, {});
      
      // Organize branches into a tree structure based on naming patterns
      Object.keys(branchMap).forEach(branchName => {
        if (branchName !== defaultBranch.name) {
          // Check if this branch is a feature branch, hotfix, etc.
          const segments = branchName.split('/');
          
          if (segments.length > 1) {
            // This is a feature branch like "feature/xyz" or "hotfix/abc"
            const parentName = segments[0];
            const parent = branchMap[parentName] || branchMap[defaultBranch.name];
            
            if (parent) {
              parent.children.push(branchMap[branchName]);
            } else {
              branchMap[defaultBranch.name].children.push(branchMap[branchName]);
            }
          } else {
            // This is a direct branch off the default branch
            branchMap[defaultBranch.name].children.push(branchMap[branchName]);
          }
        }
      });
      
      // Calculate positions for the tree layout
      const calculatePositions = (node, level = 0, index = 0, totalChildren = 1) => {
        // Horizontal position based on level
        node.x = level * 200 + 100;
        
        // Vertical position based on index within siblings
        const spacing = canvasSize.height / (totalChildren + 1);
        node.y = (index + 1) * spacing;
        
        // Process children
        if (node.children.length > 0) {
          node.children.forEach((child, i) => {
            calculatePositions(child, level + 1, i, node.children.length);
          });
        }
        
        return node;
      };
      
      setBranchTree(calculatePositions(branchMap[defaultBranch.name]));
    }
  }, [branches, canvasSize.height]);

  // Handle mouse events for panning
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      setPan(prevPan => ({
        x: prevPan.x + dx,
        y: prevPan.y + dy
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Handle wheel events for zooming
  const handleWheel = (e) => {
    e.preventDefault();
    const newZoom = zoom - e.deltaY * 0.001;
    setZoom(Math.max(0.5, Math.min(2, newZoom)));
  };
  
  // Toggle branch expansion
  const toggleBranch = (branch) => {
    if (!branch.children.length) return;
    
    setBranchTree(prevTree => {
      const toggleNode = (node) => {
        if (node === branch) {
          return { ...node, expanded: !node.expanded };
        }
        
        return {
          ...node,
          children: node.children.map(child => toggleNode(child))
        };
      };
      
      return toggleNode(prevTree);
    });
  };
  
  // Render branch connections
  const renderConnections = (node) => {
    if (!node.children.length || !node.expanded) return null;
    
    return (
      <>
        {node.children.map((child, index) => (
          <React.Fragment key={`connection-${child.name}`}>
            <line
              x1={node.x}
              y1={node.y}
              x2={child.x}
              y2={child.y}
              stroke="#6B7280"
              strokeWidth="2"
              strokeDasharray="5,5"
              strokeOpacity="0.6"
            />
            {renderConnections(child)}
          </React.Fragment>
        ))}
      </>
    );
  };
  
  // Render branch nodes
  const renderNodes = (node) => {
    return (
      <>
        <g 
          transform={`translate(${node.x}, ${node.y})`}
          onClick={() => toggleBranch(node)}
          style={{ cursor: 'pointer' }}
        >
          <circle
            r="15"
            fill={node.name === 'main' || node.name === 'master' ? '#10B981' : '#3B82F6'}
          />
          <text
            fill="white"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
          >
            {node.name.substring(0, 1).toUpperCase()}
          </text>
          <text
            x="25"
            y="0"
            dominantBaseline="middle"
            fill="#374151"
            className="dark:text-gray-200"
            fontSize="14"
          >
            {node.name}
          </text>
          <text
            x="25"
            y="20"
            dominantBaseline="middle"
            fill="#6B7280"
            className="dark:text-gray-400"
            fontSize="12"
          >
            {node.commit.sha.substring(0, 7)}
          </text>
          {node.children.length > 0 && (
            <g transform="translate(0, -25)">
              {node.expanded ? (
                <circle r="8" fill="#E5E7EB" />
              ) : (
                <circle r="8" fill="#D1D5DB" />
              )}
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="bold"
              >
                {node.expanded ? '-' : '+'}
              </text>
            </g>
          )}
        </g>
        
        {node.children.length > 0 && node.expanded && 
          node.children.map(child => renderNodes(child))}
      </>
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="text-xl font-semibold dark:text-white mb-6">Branch Network</h3>
      
      {branches.length > 0 ? (
        <div className="space-y-4">
          <div 
            className="bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-100/50 dark:border-gray-600/50 backdrop-blur-sm overflow-hidden shadow-lg"
            ref={canvasRef}
            style={{ height: '600px', width: '100%' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {branchTree && canvasSize.width > 0 ? (
              <svg 
                width="100%" 
                height="100%" 
                viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
                style={{ 
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
              >
                <g>
                  {renderConnections(branchTree)}
                  {renderNodes(branchTree)}
                </g>
              </svg>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <GitBranch className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Building branch network...</p>
              </div>
            )}
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100/50 dark:border-gray-600/50 backdrop-blur-sm">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interaction Tips:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Click on a node to expand/collapse its children</li>
              <li>• Drag the canvas to pan around</li>
              <li>• Use mouse wheel to zoom in/out</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <GitBranch className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">No branches found</h3>
          <p className="text-gray-500 dark:text-gray-400">This repository doesn't have any branches yet.</p>
        </div>
      )}
    </div>
  );
};

// Helper Functions
const getLanguageColor = (language) => {
  const colors = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    'C#': '#178600',
    PHP: '#4F5D95',
    Go: '#00ADD8',
    Ruby: '#701516',
    Swift: '#ffac45',
    Kotlin: '#F18E33',
    Rust: '#dea584',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051'
  };
  
  return colors[language] || '#9e9e9e';
};

const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  if (includeTime) {
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const formatSize = (sizeInKB) => {
  if (!sizeInKB && sizeInKB !== 0) return 'Unknown';
  
  if (sizeInKB < 1024) {
    return `${sizeInKB} KB`;
  } else {
    return `${(sizeInKB / 1024).toFixed(2)} MB`;
  }
};

export default RepoDetails;
