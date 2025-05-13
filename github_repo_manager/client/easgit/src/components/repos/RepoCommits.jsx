import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GitCommit, Calendar, User, ExternalLink, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const RepoCommits = () => {
  const { owner, repo } = useParams();
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repoDetails, setRepoDetails] = useState(null);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch repo details
        const repoResponse = await axios.get(`http://localhost:5000/api/repos/${owner}/${repo}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setRepoDetails(repoResponse.data);
        
        // Fetch commits
        const commitsResponse = await axios.get(`http://localhost:5000/api/repos/${owner}/${repo}/commits`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setCommits(commitsResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching commits:', err);
        setError('Failed to load commits. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, [owner, repo]);

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
            <Link to="/repos" className="flex items-center text-blue-500 hover:text-blue-600 mr-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Repositories
            </Link>
          </div>
          <div className="text-center py-8">
            <GitCommit className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Error Loading Commits</h2>
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
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Repositories
          </Link>
        </div>
        
        {repoDetails && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold dark:text-white mb-2 flex items-center">
                {owner}/{repo}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {repoDetails.description || 'No description provided'}
              </p>
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
        )}
      </div>
      
      {/* Commits List */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md backdrop-filter rounded-lg shadow-lg p-6 border border-white/20 dark:border-gray-700/50">
        <h2 className="text-xl font-bold dark:text-white mb-6 flex items-center">
          <GitCommit className="h-5 w-5 mr-2" />
          Commit History
        </h2>
        
        {commits.length > 0 ? (
          <div className="space-y-4">
            {commits.map((commit, index) => (
              <div 
                key={commit.sha || index} 
                className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100/50 dark:border-gray-600/50 backdrop-blur-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start">
                  <div className="p-3 rounded-full bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4 mt-1 flex-shrink-0">
                    <GitCommit className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-md font-medium text-gray-800 dark:text-white break-words">
                      {commit.commit?.message || 'No message'}
                    </h3>
                    
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {commit.author?.login || commit.commit?.author?.name || 'Unknown author'}
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(commit.commit?.author?.date || Date.now()).toLocaleDateString()} at {new Date(commit.commit?.author?.date || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      
                      <a 
                        href={commit.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500 hover:text-blue-600"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View on GitHub
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <GitCommit className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">No commits found</h3>
            <p className="text-gray-500 dark:text-gray-400">This repository doesn't have any commits yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoCommits;
