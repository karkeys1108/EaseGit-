import React from 'react';
import { Routes, Route, Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Navbar from './components/navigation/Navbar';
import GitHubCallback from './pages/GitHubCallback';
import RepoWizard from './pages/RepoWizard';
import Repos from './pages/Repos';
import RepoCommits from './components/repos/RepoCommits';
import RepoDetails from './pages/RepoDetails';
import LearnGitHub from './pages/LearnGit';
import LeaderboardPage from './pages/Leaderboard';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <main className="pt-16"> 
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/auth/github/callback" element={<GitHubCallback />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/repos"
                element={
                  <PrivateRoute>
                    <Repos />
                  </PrivateRoute>
                }
              />
              <Route
                path="/repos/:owner/:repo/commits"
                element={
                  <PrivateRoute>
                    <RepoCommits />
                  </PrivateRoute>
                }
              />
              <Route
                path="/repos/:owner/:repo"
                element={
                  <PrivateRoute>
                    <RepoDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/repo-wizard"
                element={
                  <PrivateRoute>
                    <RepoWizard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/learn-git"
                element={
                  <PrivateRoute>
                    <LearnGitHub />
                  </PrivateRoute>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <PrivateRoute>
                    <LeaderboardPage />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;