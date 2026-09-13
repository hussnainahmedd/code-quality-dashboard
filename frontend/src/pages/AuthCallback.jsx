import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Code2, Loader2, AlertCircle } from 'lucide-react';

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const called = React.useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (called.current) return;
      
      const token = searchParams.get('token');
      const code = searchParams.get('code');

      if (!token && !code) {
        setError('No authentication code or token found.');
        return;
      }

      called.current = true;

      try {
        if (token) {
          // Direct token from backend redirect
          localStorage.setItem('token', token);
          const userData = await authService.getCurrentUser();
          login(token, userData);
          navigate('/dashboard', { replace: true });
        } else if (code) {
          // Exchange code for token
          const data = await authService.loginWithCode(code);
          login(data.access_token, data.user);
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        called.current = false; // allow retry if real error
        setError(err?.response?.data?.detail || 'Authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, login, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="inline-flex p-3 bg-red-500/10 rounded-xl mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authentication Failed</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="px-6 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl font-medium hover:bg-emerald-500/20 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white">Authenticating...</h2>
        <p className="text-slate-400 mt-2">Please wait while we complete your sign-in</p>
      </div>
    </div>
  );
};
