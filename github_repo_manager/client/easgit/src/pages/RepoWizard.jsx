import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL, getAuthHeader } from '../config/api';
import { GitBranch, FileText, Check, ChevronRight, Loader2, Github, Code, BookOpen, FileCode, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const RepoWizard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userRepos, setUserRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  
  const [formData, setFormData] = useState({
    repoUrl: '',
    selectedRepo: '',
    analysisType: 'readme', // readme, structure, best-practices
  });
  
  const [analysis, setAnalysis] = useState({
    loading: false,
    error: '',
    results: null,
    readmeSuggestion: '',
    structureSuggestions: [],
    bestPractices: []
  });

  // Fetch user repositories on component mount
  useEffect(() => {
    const fetchUserRepos = async () => {
      if (!user) return;
      
      setLoadingRepos(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/user/repos`, {
          headers: getAuthHeader(token)
        });
        
        setUserRepos(response.data.repositories || []);
      } catch (error) {
        console.error('Error fetching repositories:', error);
      } finally {
        setLoadingRepos(false);
      }
    };
    
    fetchUserRepos();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // Validate repository selection or URL
  const validateRepoSelection = () => {
    if (!formData.selectedRepo && !formData.repoUrl) {
      setAnalysis(prev => ({
        ...prev,
        error: 'Please select a repository or enter a GitHub repository URL'
      }));
      return false;
    }
    
    if (formData.repoUrl && !isValidGitHubUrl(formData.repoUrl)) {
      setAnalysis(prev => ({
        ...prev,
        error: 'Please enter a valid GitHub repository URL'
      }));
      return false;
    }
    
    setAnalysis(prev => ({ ...prev, error: '' }));
    return true;
  };

  // Check if URL is a valid GitHub repository URL
  const isValidGitHubUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'github.com' && urlObj.pathname.split('/').filter(Boolean).length >= 2;
    } catch (e) {
      return false;
    }
  };

  // Extract owner and repo name from GitHub URL
  const extractRepoInfo = (url) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      return {
        owner: pathParts[0],
        repo: pathParts[1]
      };
    } catch (e) {
      return null;
    }
  };

  // Handle form submission for repository analysis
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!validateRepoSelection()) return;
      nextStep();
      return;
    }
    
    if (step === 2) {
      await analyzeRepository();
    }
  };

  // Function to analyze repository and generate suggestions
  const analyzeRepository = async () => {
    setAnalysis(prev => ({ ...prev, loading: true, error: '' }));
    
    try {
      const token = localStorage.getItem('token');
      
      // Determine repository to analyze
      let repoToAnalyze;
      if (formData.selectedRepo) {
        // Use selected repo from dropdown
        const selectedRepo = userRepos.find(repo => repo.id === parseInt(formData.selectedRepo));
        repoToAnalyze = {
          owner: selectedRepo.owner.login,
          repo: selectedRepo.name
        };
      } else {
        // Use repo from URL
        repoToAnalyze = extractRepoInfo(formData.repoUrl);
      }
      
      if (!repoToAnalyze) {
        throw new Error('Invalid repository information');
      }
      
      // This would be your actual endpoint for AI analysis
      // const response = await axios.post(`${API_BASE_URL}/ai/analyze-repo`, {
      //   owner: repoToAnalyze.owner,
      //   repo: repoToAnalyze.repo,
      //   analysisType: formData.analysisType
      // }, {
      //   headers: getAuthHeader(token)
      // });
      
      // For demo purposes, generate mock data
      const mockAnalysisResults = generateMockAnalysis(repoToAnalyze);
      
      setAnalysis(prev => ({
        ...prev,
        loading: false,
        results: mockAnalysisResults,
        readmeSuggestion: mockAnalysisResults.readmeSuggestion,
        structureSuggestions: mockAnalysisResults.structureSuggestions,
        bestPractices: mockAnalysisResults.bestPractices
      }));
      
      nextStep();
    } catch (error) {
      console.error('Error analyzing repository:', error);
      setAnalysis(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to analyze repository. The AI analysis feature is still under development.'
      }));
    }
  };

  // Generate mock analysis results for demonstration
  const generateMockAnalysis = (repoInfo) => {
    return {
      repoName: repoInfo.repo,
      owner: repoInfo.owner,
      readmeSuggestion: `# ${repoInfo.repo}\n\nA comprehensive tool for managing GitHub repositories with ease.\n\n## Features\n\n- Repository creation and management\n- GitHub statistics and insights\n- Collaboration tools\n- AI-powered repository analysis\n\n## Installation\n\n\`\`\`bash\n# Clone the repository\ngit clone https://github.com/${repoInfo.owner}/${repoInfo.repo}.git\n\n# Navigate to the project directory\ncd ${repoInfo.repo}\n\n# Install dependencies\nnpm install\n\n# Start the application\nnpm start\n\`\`\`\n\n## Usage\n\nDetailed documentation can be found in the [docs](/docs) directory.\n\n## Contributing\n\nContributions are welcome! Please feel free to submit a Pull Request.\n\n## License\n\nThis project is licensed under the MIT License - see the LICENSE file for details.`,
      structureSuggestions: [
        { name: 'Add a docs/ directory for documentation', importance: 'high' },
        { name: 'Create a CONTRIBUTING.md file', importance: 'medium' },
        { name: 'Add a .github/workflows directory for CI/CD', importance: 'high' },
        { name: 'Include a LICENSE file', importance: 'medium' },
        { name: 'Add tests/ directory with unit tests', importance: 'high' }
      ],
      bestPractices: [
        { name: 'Add descriptive commit messages', category: 'git' },
        { name: 'Use semantic versioning', category: 'versioning' },
        { name: 'Document all public APIs', category: 'documentation' },
        { name: 'Implement CI/CD pipelines', category: 'devops' },
        { name: 'Add code coverage reporting', category: 'testing' }
      ]
    };
  };

  // Render repository selection options
  const renderRepositorySelection = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-6 dark:text-white">Select Repository to Analyze</h2>
        
        {analysis.error && (
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg mb-4">
            <p className="text-red-700 dark:text-red-400 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {analysis.error}
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
              Your Repositories
            </label>
            <select
              name="selectedRepo"
              value={formData.selectedRepo}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loadingRepos}
            >
              <option value="">Select a repository</option>
              {userRepos.map(repo => (
                <option key={repo.id} value={repo.id}>
                  {repo.name} {repo.private ? '(Private)' : '(Public)'}
                </option>
              ))}
            </select>
            {loadingRepos && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                <Loader2 className="animate-spin h-4 w-4 mr-1" />
                Loading your repositories...
              </p>
            )}
          </div>
          
          <div className="flex items-center">
            <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700"></div>
            <span className="px-4 text-gray-500 dark:text-gray-400 text-sm">OR</span>
            <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700"></div>
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
              GitHub Repository URL
            </label>
            <div className="flex">
              <div className="flex items-center px-3 bg-gray-100 dark:bg-gray-800 border border-r-0 rounded-l-lg">
                <Github className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="text"
                name="repoUrl"
                value={formData.repoUrl}
                onChange={handleChange}
                placeholder="https://github.com/username/repository"
                className="flex-grow px-3 py-2 border rounded-r-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enter the URL of any public GitHub repository
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render analysis type selection
  const renderAnalysisTypeSelection = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-6 dark:text-white">Select Analysis Type</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              formData.analysisType === 'readme' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                : 'hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500'
            }`}
            onClick={() => setFormData({...formData, analysisType: 'readme'})}
          >
            <div className="flex items-center mb-3">
              <FileText className={`h-6 w-6 mr-2 ${formData.analysisType === 'readme' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`} />
              <h3 className={`font-medium ${formData.analysisType === 'readme' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                README Analysis
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate an improved README.md file with proper structure and content.
            </p>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              formData.analysisType === 'structure' 
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' 
                : 'hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500'
            }`}
            onClick={() => setFormData({...formData, analysisType: 'structure'})}
          >
            <div className="flex items-center mb-3">
              <Code className={`h-6 w-6 mr-2 ${formData.analysisType === 'structure' ? 'text-purple-500' : 'text-gray-500 dark:text-gray-400'}`} />
              <h3 className={`font-medium ${formData.analysisType === 'structure' ? 'text-purple-700 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}>
                Repository Structure
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analyze project structure and suggest improvements for organization.
            </p>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              formData.analysisType === 'best-practices' 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/30' 
                : 'hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500'
            }`}
            onClick={() => setFormData({...formData, analysisType: 'best-practices'})}
          >
            <div className="flex items-center mb-3">
              <BookOpen className={`h-6 w-6 mr-2 ${formData.analysisType === 'best-practices' ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`} />
              <h3 className={`font-medium ${formData.analysisType === 'best-practices' ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                Best Practices
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get recommendations for following industry best practices and standards.
            </p>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-6">
          <p className="text-blue-700 dark:text-blue-400 text-sm">
            <strong>Note:</strong> The AI will analyze the repository and provide suggestions based on the selected analysis type.
            This feature is currently under development and results may vary.
          </p>
        </div>
      </div>
    );
  };

  // Render analysis results
  const renderAnalysisResults = () => {
    if (!analysis.results) return null;
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-6 dark:text-white">
          Analysis Results for <span className="text-blue-600 dark:text-blue-400">{analysis.results.owner}/{analysis.results.repoName}</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2">
            {formData.analysisType === 'readme' && (
              <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b dark:border-gray-700 flex items-center">
                  <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">README.md Suggestion</h3>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-auto max-h-[500px] font-mono text-sm">
                    {analysis.readmeSuggestion.split('\n').map((line, index) => (
                      <div key={index} className="whitespace-pre-wrap">
                        {line || '\u00A0'}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                      onClick={() => {
                        navigator.clipboard.writeText(analysis.readmeSuggestion);
                        alert('README copied to clipboard!');
                      }}
                    >
                      <FileCode className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {formData.analysisType === 'structure' && (
              <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b dark:border-gray-700 flex items-center">
                  <Code className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Repository Structure Suggestions</h3>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900">
                  <ul className="divide-y dark:divide-gray-700">
                    {analysis.structureSuggestions.map((suggestion, index) => (
                      <li key={index} className="py-3 flex items-start">
                        <div className={`rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 ${
                          suggestion.importance === 'high' 
                            ? 'bg-red-100 dark:bg-red-900/30' 
                            : suggestion.importance === 'medium'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30'
                              : 'bg-green-100 dark:bg-green-900/30'
                        }`}>
                          <span className={`text-xs font-bold ${
                            suggestion.importance === 'high' 
                              ? 'text-red-700 dark:text-red-400' 
                              : suggestion.importance === 'medium'
                                ? 'text-yellow-700 dark:text-yellow-400'
                                : 'text-green-700 dark:text-green-400'
                          }`}>
                            {suggestion.importance === 'high' ? 'H' : suggestion.importance === 'medium' ? 'M' : 'L'}
                          </span>
                        </div>
                        <div>
                          <p className="text-gray-800 dark:text-gray-200">{suggestion.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Importance: <span className="font-medium capitalize">{suggestion.importance}</span>
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {formData.analysisType === 'best-practices' && (
              <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b dark:border-gray-700 flex items-center">
                  <BookOpen className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Best Practices Recommendations</h3>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900">
                  <div className="grid grid-cols-1 gap-4">
                    {analysis.bestPractices.map((practice, index) => (
                      <div key={index} className="border rounded-lg p-3 dark:border-gray-700">
                        <div className="flex items-center">
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 mr-2">
                            {practice.category}
                          </span>
                          <h4 className="text-gray-800 dark:text-gray-200">{practice.name}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="col-span-1">
            <div className="border rounded-lg overflow-hidden dark:border-gray-700 sticky top-4">
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b dark:border-gray-700">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Analysis Summary</h3>
              </div>
              <div className="p-4 bg-white dark:bg-gray-900">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Repository</h4>
                    <p className="text-gray-800 dark:text-gray-200 mt-1">{analysis.results.owner}/{analysis.results.repoName}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Analysis Type</h4>
                    <p className="text-gray-800 dark:text-gray-200 mt-1 capitalize">{formData.analysisType.replace('-', ' ')}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Status</h4>
                    <div className="flex items-center mt-1">
                      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <span className="ml-2 text-sm text-green-600 dark:text-green-400">100%</span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="button"
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      onClick={() => setStep(1)}
                    >
                      Analyze Another Repository
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Repository Analyzer</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Use AI to analyze your GitHub repositories and get suggestions for improvements.
        </p>
      </div>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
              step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              1
            </div>
            <div className={`h-1 w-12 mx-2 ${
              step >= 2 ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
            }`}></div>
          </div>
          
          <div className="flex items-center">
            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
              step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              2
            </div>
            <div className={`h-1 w-12 mx-2 ${
              step >= 3 ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
            }`}></div>
          </div>
          
          <div className="flex items-center">
            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
              step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              3
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-2 text-sm">
          <span className={step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}>
            Select Repository
          </span>
          <span className={step >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}>
            Choose Analysis
          </span>
          <span className={step >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}>
            View Results
          </span>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit}>
          {step === 1 && renderRepositorySelection()}
          {step === 2 && renderAnalysisTypeSelection()}
          {step === 3 && renderAnalysisResults()}
          
          {step < 3 && (
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Back
                </button>
              )}
              
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ml-auto flex items-center"
                disabled={analysis.loading}
              >
                {analysis.loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    {step === 1 ? 'Validating...' : 'Analyzing...'}
                  </>
                ) : (
                  <>
                    {step === 1 ? 'Next' : 'Analyze Repository'}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>AI Repository Analysis is currently in beta. Results may vary.</p>
      </div>
    </div>
  );
};

export default RepoWizard;
