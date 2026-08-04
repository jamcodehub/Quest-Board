import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Shell({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Quests', path: '/' },
    { name: 'Character', path: '/character' },
    { name: 'Notepages', path: '/notepages' },
  ];

  return (
    <div className="flex h-screen bg-[#07090e] text-slate-100 overflow-hidden font-sans">
      
      {/* --- MOBILE TOP BAR --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0b0f19] border-b border-slate-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <span className="font-semibold tracking-wider text-slate-200 text-sm">QUEST BOARD</span>
        </div>
        <span className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded font-mono">Online</span>
      </div>

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#0b0f19] border-r border-slate-800/80 
        flex flex-col justify-between transform transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        pt-16 md:pt-0
      `}>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-8">
            <h1 className="text-sm font-semibold tracking-widest text-slate-200 uppercase">Quest Board</h1>
            <p className="text-xs text-slate-500 mt-0.5">Progress & Task Tracker</p>
          </div>

          {/* Player Stats Summary */}
          <div className="mb-6 p-3.5 bg-slate-900/60 rounded-lg border border-slate-800/80 space-y-2">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Session Status</div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Gold Earned</span>
              <span className="font-mono font-semibold text-slate-200">120</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Experience</span>
              <span className="font-mono font-semibold text-slate-200">450 / 600</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors
                  ${isActive 
                    ? 'bg-slate-800 text-slate-100 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'}
                `}
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer with Subtle Hidden Admin Button */}
        <div className="p-4 border-t border-slate-800/80 bg-[#090c14] flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono">v1.2.0</span>
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/admin');
            }}
            className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-900"
            title="Guild Master Portal"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-[11px] tracking-wide">Guild Master</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#07090e] pt-16 md:pt-0">
        {children}
      </main>

    </div>
  );
}