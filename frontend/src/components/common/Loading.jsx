import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loading = ({ text = "Analyzing..." }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
    <p className="text-slate-400 font-medium animate-pulse">{text}</p>
  </div>
);

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-700/50 rounded-lg ${className}`}></div>
);
