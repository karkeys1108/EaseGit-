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
      
      if (code) {
        try {
          const success = await login(code);
          if (success) {
            navigate('/dashboard');
          } else {
            // Handle login failure
            navigate('/', { state: { error: 'Authentication failed' } });
          }
        } catch (error) {
          console.error('GitHub callback error:', error);
          navigate('/', { state: { error: 'Authentication failed' } });
        }
      } else {
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
