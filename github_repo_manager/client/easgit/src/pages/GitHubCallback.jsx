import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GitHubCallback = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      console.log('GitHub callback received, code exists:', !!code);
      
      if (code) {
        try {
          console.log('Attempting to login with code');
          const success = await login(code);
          console.log('Login result:', success);
          
          if (success) {
            console.log('Login successful, navigating to dashboard');
            navigate('/dashboard');
          } else {
            // Handle login failure
            console.log('Login failed, navigating to home');
            navigate('/', { state: { error: 'Authentication failed' } });
          }
        } catch (error) {
          console.error('GitHub callback error:', error);
          navigate('/', { state: { error: 'Authentication failed' } });
        }
      } else {
        console.log('No code found, navigating to home');
        navigate('/');
      }
    };

    handleCallback();
  }, [searchParams, login, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2 dark:text-white">Authenticating with GitHub...</h2>
        <p className="text-gray-600 dark:text-gray-400">Please wait while we complete the process.</p>
      </div>
    </div>
  );
};

export default GitHubCallback;
