import React, { useEffect, useRef } from 'react';
import { GitBranch, ArrowRight, Code, Users, Star, Zap, Target, Shield, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const GridBackground = () => {
  const { isDark } = useTheme();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const drawGrid = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Draw grid
      ctx.strokeStyle = isDark ? 'rgba(59, 130, 246, 0.05)' : 'rgba(37, 99, 235, 0.05)';
      ctx.lineWidth = 1;

      const gridSize = 30;

      // Vertical lines
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw dots at intersections
      ctx.fillStyle = isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.15)';
      for (let x = 0; x <= canvas.width; x += gridSize) {
        for (let y = 0; y <= canvas.height; y += gridSize) {
          // Draw dots at every other intersection for a more balanced look
          if ((x/gridSize + y/gridSize) % 2 === 0) {
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    // Draw initial grid
    drawGrid();

    // Redraw on window resize
    window.addEventListener('resize', drawGrid);
    
    // Redraw on theme change
    return () => {
      window.removeEventListener('resize', drawGrid);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
    />
  );
};

const Feature = ({ icon: Icon, title, description }) => {
  const { isDark } = useTheme();
  return (
    <div className="flex flex-col items-center text-center p-6">
      <div className={`rounded-full p-4 mb-4 ${
        isDark ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <Icon className={`h-6 w-6 ${
          isDark ? 'text-blue-400' : 'text-blue-600'
        }`} />
      </div>
      <h3 className={`text-xl font-bold mb-2 font-lato ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {title}
      </h3>
      <p className={`${
        isDark ? 'text-gray-400' : 'text-gray-600'
      } font-lato`}>
        {description}
      </p>
    </div>
  );
};

const BenefitSection = ({ title, description, audience, icon: Icon }) => {
  const { isDark } = useTheme();
  return (
    <div className={`p-6 rounded-lg border ${
      isDark 
        ? 'bg-gray-800/50 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center mb-4">
        <div className={`rounded-full p-3 mr-4 ${
          isDark ? 'bg-gray-700' : 'bg-blue-50'
        }`}>
          <Icon className={`h-6 w-6 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`} />
        </div>
        <h3 className={`text-xl font-bold font-lato ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h3>
      </div>
      <p className={`mb-4 font-lato ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {description}
      </p>
      <div className={`font-lato font-medium ${
        isDark ? 'text-blue-400' : 'text-blue-600'
      }`}>
        Perfect for: {audience}
      </div>
    </div>
  );
};

const ScrollIndicator = ({ isDark }) => (
  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce cursor-pointer"
       onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
    <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Scroll to explore</div>
    <ChevronDown className={`h-6 w-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
  </div>
);

const Welcome = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleGitHubCallback(code);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGitHubCallback = async (code) => {
    const success = await login(code);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleGitHubLogin = () => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&scope=repo user`;
    window.location.href = githubAuthUrl;
  };
  const { isDark } = useTheme();

  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth'
          });
        }
      });
    });
  }, []);

  return (
    <div className={`relative ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Border Lines */}
      <div className="fixed left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent"></div>
      <div className="fixed right-12 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent"></div>

      {/* Additional decorative lines */}
      <div className="fixed left-[3.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500/10 to-transparent"></div>
      <div className="fixed right-[3.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500/10 to-transparent"></div>

      {/* Hero Section */}
      <section className="relative overflow-hidden -mt-16">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 dark:opacity-5" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white dark:via-gray-900/80 dark:to-gray-900" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-block">
              <div className="flex items-center space-x-4 mb-4">
                <GitBranch className={`h-16 w-16 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <h1 className={`text-5xl md:text-6xl font-bold mb-6 font-shareTech tracking-tight ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                The Future of
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"> Git Management</span>
              </h1>
              <p className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto font-lato ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Experience a revolutionary approach to Git repository management with AI-powered insights,
                seamless collaboration tools, and intuitive workflows.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={handleGitHubLogin}
                  className={`group relative px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 
                    ${isDark 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } transform hover:scale-105 font-lato flex items-center justify-center`}
                >
                  <GitBranch className="mr-2 h-5 w-5" />
                  Sign in with GitHub
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
                <a
                  href="#features"
                  className={`px-8 py-4 text-lg font-semibold rounded-lg border-2 transition-all duration-200 font-lato
                    ${isDark
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative blobs */}
        <ScrollIndicator isDark={isDark} />
      </section>

      {/* Features Section */}
      <section id="features" className={`min-h-screen flex items-center ${
        isDark ? 'bg-gray-800/50' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-bold mb-4 font-shareTech ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Why Choose EasGit?
            </h2>
            <p className={`text-lg max-w-2xl mx-auto font-lato ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Experience a new way of managing your Git repositories with features designed for modern development teams.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Feature
              icon={Code}
              title="Smart Automation"
              description="Automate repetitive tasks with AI-powered workflows and intelligent suggestions for branch management and code reviews."
            />
            <Feature
              icon={Users}
              title="Enhanced Collaboration"
              description="Foster seamless team collaboration with real-time updates, integrated chat, and automated code review assignments."
            />
            <Feature
              icon={Star}
              title="Deep Insights"
              description="Get detailed analytics about your repository's performance, team productivity, and code quality metrics."
            />
          </div>
        </div>
      </section>

      {/* Who Benefits Section */}
      <section className="min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-bold mb-4 font-shareTech ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Who Benefits from EasGit?
            </h2>
            <p className={`text-lg max-w-2xl mx-auto font-lato ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Our platform is designed to serve diverse needs across the development spectrum.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <BenefitSection
              icon={Target}
              title="Development Teams"
              description="Streamline your workflow with automated code reviews, branch management, and team collaboration features."
              audience="Software development teams of all sizes"
            />
            <BenefitSection
              icon={Shield}
              title="Project Managers"
              description="Get clear insights into project progress, team performance, and code quality metrics."
              audience="Technical leads and project managers"
            />
            <BenefitSection
              icon={Zap}
              title="Individual Developers"
              description="Boost your productivity with AI-powered suggestions and automated Git workflows."
              audience="Freelancers and independent developers"
            />
            <BenefitSection
              icon={Users}
              title="Open Source Projects"
              description="Manage contributions efficiently with automated issue tracking and contributor analytics."
              audience="Open source maintainers and contributors"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Welcome;
