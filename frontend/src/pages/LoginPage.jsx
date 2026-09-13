import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Github, Sparkles, BarChart3, GitCompare, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      const data = await authService.getGithubAuthUrl();
      window.location.href = data.url;
    } catch (err) {
      setError('Failed to initiate GitHub login. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.demoLogin();
      login(data.access_token, data.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('Failed to start demo mode. Is the backend running?');
      setIsLoading(false);
    }
  };

  const features = [
    { icon: BarChart3, title: 'Code Metrics', desc: 'Cyclomatic complexity, maintainability index, Halstead metrics' },
    { icon: GitCompare, title: 'Compare Repos', desc: 'Side-by-side comparison of code quality across repositories' },
    { icon: Shield, title: 'Quality Grades', desc: 'A-F grading system for code complexity and maintainability' },
    { icon: Sparkles, title: 'Visual Dashboards', desc: 'Interactive charts and trend tracking over time' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Branding */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900/50 rounded-xl flex items-center justify-center border border-emerald-500/20 shadow-xl overflow-hidden">
                  <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-medium text-emerald-400 tracking-wider uppercase">Code Quality Dashboard</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Analyze your code.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                  Improve quality.
                </span>
              </h1>
              <p className="text-lg text-slate-400 max-w-md">
                Connect your GitHub repositories and get comprehensive code quality metrics, 
                interactive visualizations, and actionable insights.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/40 hover:border-slate-600/60 transition-colors">
                  <Icon className="w-5 h-5 text-emerald-400 mb-2" />
                  <h3 className="font-semibold text-sm text-slate-200">{title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Login card */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex rounded-2xl mb-4 overflow-hidden border border-emerald-500/20 shadow-xl w-16 h-16">
                  <img src="/logo.jpg" alt="CodeQD" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-2xl font-bold text-white">Welcome</h2>
                <p className="text-sm text-slate-400 mt-1">Sign in to analyze your repositories</p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleGitHubLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  Sign in with GitHub
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-slate-800/80 text-slate-500 text-sm">or</span>
                  </div>
                </div>

                <button
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl font-semibold hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-5 h-5" />
                  Try Demo Mode
                </button>
              </div>

              <p className="text-xs text-slate-500 text-center mt-6">
                Demo mode uses sample data — no GitHub account required
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
