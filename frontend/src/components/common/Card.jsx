import React from 'react';

export const Card = ({ children, className = '', title, subtitle, action }) => (
  <div className={`relative bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-md overflow-hidden ${className}`}>
    {/* Subtle top highlight for 3D effect */}
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
    
    {(title || action) && (
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div>
          {title && <h3 className="text-lg font-semibold text-slate-100 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {action && <div className="ml-4">{action}</div>}
      </div>
    )}
    <div className="relative z-10">
      {children}
    </div>
  </div>
);
