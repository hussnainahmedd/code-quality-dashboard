import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout = ({ children, title }) => (
  <div className="flex min-h-screen bg-slate-950 relative overflow-hidden">
    {/* Global ambient background glow */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
    </div>
    
    <div className="z-10 flex w-full">
      <Sidebar />
      <div className="flex-1 ml-64 min-w-0 flex flex-col relative z-20">
        <Header title={title} />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  </div>
);
