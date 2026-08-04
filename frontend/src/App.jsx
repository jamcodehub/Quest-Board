import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import { GhostDialogue } from './components/GhostDialogue.jsx';

// --- HOME / STUDENT VIEW COMPONENT ---
function StudentPortal() {
  const [code, setCode] = useState('');
  const [activeQuests, setActiveQuests] = useState(null);
  const [error, setError] = useState('');

  // Check for an existing session when the component loads
  useEffect(() => {
    const savedCode = localStorage.getItem('activeQuestCode');
    if (savedCode) {
      fetchQuests(savedCode);
    }
  }, []);

  const fetchQuests = async (questCode) => {
    setError('');
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/quests/${questCode}`);
      
      if (response.ok) {
        const data = await response.json();
        setActiveQuests(data);
        localStorage.setItem('activeQuestCode', questCode);
      } else {
        setError('Invalid Quest Code. Speak to the Guild Master.');
        localStorage.removeItem('activeQuestCode');
      }
    } catch (err) {
      console.error('Network error', err);
      setError('Network error. Is the server running?');
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
    <div className="flex flex-col items-center justify-center p-4 w-full flex-grow">
      {!activeQuests ? (
        <div className="flex flex-col items-center w-full max-w-sm mt-12">
          <h1 className="text-3xl mb-8 font-bold text-slate-100">Enter Quest Code</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
            <input 
              type="text" 
              placeholder="e.g. crimson-dragon-42"
              className="p-3 text-black rounded border-2 border-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button 
              type="submit" 
              className="bg-purple-600 text-white font-semibold p-3 rounded hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/30"
            >
              Reveal Quests
            </button>
            {error && <p className="text-red-400 text-center font-medium mt-2">{error}</p>}
          </form>
        </div>
      ) : (
        <div className="w-full max-w-2xl flex flex-col mt-6">
          <div className="w-full flex justify-end mb-4">
            <button 
              onClick={logout} 
              className="text-sm underline text-slate-400 hover:text-white transition-colors"
            >
              Clear Session
            </button>
          </div>
          <GhostDialogue quests={activeQuests} />
        </div>
      )}
    </div>
  );
}

// --- ADMIN VIEW COMPONENT ---
function AdminPortal() {
  const [adminPassword, setAdminPassword] = useState('');
  const [tasksInput, setTasksInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleCreateQuests = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setGeneratedCode('');

    // Split textarea lines into an array of task strings
    const tasksArray = tasksInput
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (tasksArray.length === 0) {
      setStatusMessage('Please enter at least one task.');
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
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
        setStatusMessage('Quest Board successfully created!');
        setTasksInput('');
      } else {
        setStatusMessage(data.message || 'Authorization failed or error creating quests.');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Network error connecting to backend.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full flex-grow">
      <div className="flex flex-col items-center w-full max-w-md mt-8 bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-xl backdrop-blur-md">
        <h1 className="text-2xl mb-6 font-bold text-slate-100">Guild Master Portal</h1>
        <form onSubmit={handleCreateQuests} className="flex flex-col gap-4 w-full">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Admin Password</label>
            <input 
              type="password"
              className="w-full p-3 text-black rounded border border-slate-600 focus:outline-none focus:border-purple-500"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Tasks (One per line)</label>
            <textarea 
              rows="5"
              placeholder="Read Chapter 4&#10;Build a React component&#10;Defeat the goblin boss"
              className="w-full p-3 text-black rounded border border-slate-600 focus:outline-none focus:border-purple-500 font-mono text-sm"
              value={tasksInput}
              onChange={(e) => setTasksInput(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="bg-purple-600 text-white font-semibold p-3 rounded hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/30"
          >
            Generate Quest Board
          </button>
        </form>

        {statusMessage && (
          <p className={`mt-4 text-center font-medium ${generatedCode ? 'text-green-400' : 'text-red-400'}`}>
            {statusMessage}
          </p>
        )}

        {generatedCode && (
          <div className="mt-4 p-4 bg-slate-900 rounded border border-purple-500/50 w-full text-center">
            <span className="text-xs text-slate-400 block mb-1">ASSIGNED QUEST CODE:</span>
            <span className="font-mono text-xl text-purple-300 font-bold select-all">{generatedCode}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// --- MAIN APP WRAPPER ---
export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<StudentPortal />} />
          <Route path="/admin" element={<AdminPortal />} />
        </Routes>
      </div>
    </Router>
  );
}