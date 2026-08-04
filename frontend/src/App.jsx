import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Shell from './components/Shell.jsx';
import GhostDialogue from './components/GhostDialogue.jsx';

// --- QUESTS CHECKLIST VIEW COMPONENT ---
function QuestsPortal() {
  const [code, setCode] = useState('');
  const [activeQuests, setActiveQuests] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedCode = localStorage.getItem('activeQuestCode');
    if (savedCode) {
      fetchQuests(savedCode);
    }
  }, []);

  const fetchQuests = async (questCode) => {
    setError('');
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';
      const response = await fetch(`${API_BASE_URL}/api/quests/${questCode}`);
      
      if (response.ok) {
        const data = await response.json();
        setActiveQuests(data);
        localStorage.setItem('activeQuestCode', questCode);
      } else {
        setError('Invalid quest code. Please verify with your instructor.');
        localStorage.removeItem('activeQuestCode');
      }
    } catch (err) {
      console.error('Network error', err);
      setError('Unable to connect to server.');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetchQuests(code);
  };

  const logout = () => {
    localStorage.removeItem('activeQuestCode');
    setActiveQuests(null);
    setCode('');
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full flex-grow">
      {!activeQuests ? (
        <div className="flex flex-col items-center w-full max-w-sm bg-slate-900/60 p-6 rounded-lg border border-slate-800 shadow-lg">
          <h1 className="text-lg font-semibold text-slate-100 mb-1">Enter Quest Code</h1>
          <p className="text-xs text-slate-400 mb-6 text-center">Input your assigned code to load your active checklist.</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-3 w-full">
            <input 
              type="text" 
              placeholder="e.g. crimson-dragon-42"
              className="p-2.5 text-xs text-slate-900 rounded border border-slate-700 focus:outline-none focus:border-slate-500 bg-slate-100 font-mono"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button 
              type="submit" 
              className="bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium py-2.5 rounded transition-colors border border-slate-700"
            >
              Load Quests
            </button>
            {error && <p className="text-red-400 text-center text-xs font-medium mt-1">{error}</p>}
          </form>
        </div>
      ) : (
        <div className="w-full max-w-2xl flex flex-col mt-4">
          <div className="w-full flex justify-between items-center mb-4 px-2">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Active Checklist</h2>
            <button 
              onClick={logout} 
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors underline"
            >
              Switch Code
            </button>
          </div>
          <GhostDialogue quests={activeQuests} />
        </div>
      )}
    </div>
  );
}

// --- ADMIN PORTAL COMPONENT ---
function AdminPortal() {
  const [adminPassword, setAdminPassword] = useState('');
  const [tasksInput, setTasksInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleCreateQuests = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setGeneratedCode('');

    const tasksArray = tasksInput
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (tasksArray.length === 0) {
      setStatusMessage('Please enter at least one task.');
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';
      const response = await fetch(`${API_BASE_URL}/api/admin/quests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword
        },
        body: JSON.stringify({ tasks: tasksArray })
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedCode(data.questCode);
        setStatusMessage('Quest board successfully created.');
        setTasksInput('');
      } else {
        setStatusMessage(data.message || 'Authorization failed.');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Network error connecting to backend.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full flex-grow">
      <div className="flex flex-col items-center w-full max-w-md bg-slate-900/60 p-6 rounded-lg border border-slate-800 shadow-lg">
        <h1 className="text-lg font-semibold text-slate-100 mb-6">Guild Master Portal</h1>
        <form onSubmit={handleCreateQuests} className="flex flex-col gap-4 w-full text-xs">
          <div>
            <label className="block uppercase tracking-wider text-slate-400 mb-1 font-medium">Admin Password</label>
            <input 
              type="password"
              className="w-full p-2.5 text-slate-900 rounded border border-slate-700 focus:outline-none focus:border-slate-500 bg-slate-100"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider text-slate-400 mb-1 font-medium">Tasks (One per line)</label>
            <textarea 
              rows="5"
              placeholder="Complete Module 1 Quiz&#10;Submit GitHub repository link&#10;Review error handling code"
              className="w-full p-2.5 text-slate-900 rounded border border-slate-700 focus:outline-none focus:border-slate-500 font-mono bg-slate-100 text-xs"
              value={tasksInput}
              onChange={(e) => setTasksInput(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium py-2.5 rounded transition-colors border border-slate-700 mt-1"
          >
            Generate Quest Code
          </button>
        </form>

        {statusMessage && (
          <p className={`mt-4 text-center text-xs font-medium ${generatedCode ? 'text-emerald-400' : 'text-red-400'}`}>
            {statusMessage}
          </p>
        )}

        {generatedCode && (
          <div className="mt-4 p-3 bg-slate-950 rounded border border-slate-800 w-full text-center">
            <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">Generated Code</span>
            <span className="font-mono text-sm text-slate-200 font-semibold select-all">{generatedCode}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// --- PLACEHOLDER PAGES ---
function PlaceholderPage({ title }) {
  return (
    <div className="p-8">
      <h2 className="text-lg font-semibold text-slate-200 mb-1">{title}</h2>
      <p className="text-xs text-slate-400">This section is currently empty.</p>
    </div>
  );
}

// --- MAIN APP WRAPPER ---
export default function App() {
  return (
    <Router>
      <Shell>
        <Routes>
          <Route path="/" element={<QuestsPortal />} />
          <Route path="/character" element={<PlaceholderPage title="Character & Stats" />} />
          <Route path="/notepages" element={<PlaceholderPage title="Notepages" />} />
          <Route path="/admin" element={<AdminPortal />} />
        </Routes>
      </Shell>
    </Router>
  );
}