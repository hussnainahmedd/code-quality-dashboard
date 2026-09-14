import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Github, CheckCircle2, PlayCircle, Circle } from 'lucide-react';
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

  return (
    <main className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4 font-sans text-white antialiased">
      
      {/* Left Column (Hero & Background Video) */}
      <div className="relative hidden lg:flex flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full w-[52%] bg-[#1A1A1A]">
        {/* Background Video */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4" 
            type="video/mp4" 
          />
        </video>

        {/* Hero Content Container */}
        <motion.div 
          className="z-10 w-full max-w-sm space-y-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
          }}
        >
          {/* Brand/Logo */}
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }} className="flex items-center gap-2">
            <Circle className="fill-white text-white w-6 h-6" />
            <span className="text-xl font-semibold tracking-tight">Code Quality Dashboard</span>
          </motion.div>
          
          {/* Heading Block */}
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
            <h1 className="text-4xl font-medium tracking-tight whitespace-nowrap">Join Dashboard</h1>
            <p className="text-white/60 text-sm leading-relaxed px-1 mt-2">
              Follow these 3 quick phases to activate your space.
            </p>
          </motion.div>

          {/* Steps */}
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }} className="space-y-3">
            <StepItem number={1} text="Authenticate with GitHub" active />
            <StepItem number={2} text="Select a repository" />
            <StepItem number={3} text="Analyze code quality" />
          </motion.div>
        </motion.div>
      </div>

      {/* Right Column (Sign Up Form area) */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden">
        <motion.div 
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Header */}
          <div>
            <h2 className="text-3xl font-medium tracking-tight">Create New Profile</h2>
            <p className="text-white/40 text-sm mt-2">Connect your GitHub account to begin the journey.</p>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Social Buttons Block */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-black border border-white/10 rounded-xl hover:bg-white/5 h-12 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Github className="w-5 h-5" />
              <span className="text-sm font-medium">Github</span>
            </button>
            <button 
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-black border border-white/10 rounded-xl hover:bg-white/5 h-12 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <PlayCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Demo</span>
            </button>
          </div>
          
          {/* Divider */}
          <div className="relative py-2 flex items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-medium text-white/40 uppercase tracking-widest bg-black px-4">Or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* The form from the prompt, re-purposed slightly for visual matching */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="First Name" placeholder="ex. Alex" type="text" disabled />
              <InputGroup label="Last Name" placeholder="ex. Sterling" type="text" disabled />
            </div>
            <InputGroup label="Email" placeholder="ex. alex.s@aurora.io" type="email" disabled />
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white block">Password</label>
              <div className="relative">
                <input 
                  disabled
                  type="password" 
                  placeholder="Secure your account" 
                  className="w-full bg-[#1A1A1A] border-none rounded-xl h-11 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 disabled:opacity-50"
                />
              </div>
              <p className="text-white/40 text-[10px] mt-1">Requires at least 8 symbols.</p>
            </div>
          </div>

          <button 
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] mt-4 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Connecting...' : 'Create Account via GitHub'}
          </button>
          
          <div className="text-center mt-6">
            <span className="text-white/40 text-sm">Member of the team? </span>
            <button onClick={handleGitHubLogin} className="text-white text-sm font-medium hover:underline cursor-pointer">Log in</button>
          </div>
        </motion.div>
      </div>

    </main>
  );
};

function StepItem({ number, text, active }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-white text-black border border-white' : 'bg-[#1A1A1A] text-white border-transparent'}`}>
      <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${active ? 'bg-black text-white' : 'bg-white/10 text-white/40'}`}>
        {number}
      </div>
      <span className="font-medium text-sm">{text}</span>
    </div>
  );
}

function InputGroup({ label, placeholder, type, disabled }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white block">{label}</label>
      <input 
        type={type} 
        placeholder={placeholder} 
        disabled={disabled}
        className="w-full bg-[#1A1A1A] border-none rounded-xl h-11 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 disabled:opacity-50"
      />
    </div>
  );
}
