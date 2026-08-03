import React, { useState, useEffect } from 'react';

export default function QuestBoard() {
  const [questCode, setQuestCode] = useState('');
  const [quests, setQuests] = useState(null);
  const [error, setError] = useState('');

  // Check local storage on load to see if they already entered a code
  useEffect(() => {
    const savedCode = localStorage.getItem('activeQuestCode');
    if (savedCode) {
      fetchQuests(savedCode);
    }
  }, []);

  const fetchQuests = (code) => {
    // In a real app, this would be a fetch() call to your backend
    // fetching data linked ONLY to this random string, not a user ID.
    if (code === 'crimson-dragon-42') {
      setQuests([
        { id: 1, title: 'Defeat the Calculus Worksheet', status: 'pending' },
        { id: 2, title: 'Map the Cell Structure', status: 'completed' }
      ]);
      localStorage.setItem('activeQuestCode', code);
      setError('');
    } else {
      setError('Invalid Quest Code. Speak to the Guild Master.');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetchQuests(questCode);
  };

  const logout = () => {
    localStorage.removeItem('activeQuestCode');
    setQuests(null);
    setQuestCode('');
  };

  // 1. The "Login" Screen
  if (!quests) {
    return (
      <div className="flex flex-col items-center p-8 bg-slate-900 text-white min-h-screen">
        <h1 className="text-3xl mb-6">Enter Your Quest Code</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input 
            type="text" 
            value={questCode} 
            onChange={(e) => setQuestCode(e.target.value)}
            className="p-2 text-black rounded"
            placeholder="e.g. crimson-dragon-42"
          />
          <button type="submit" className="bg-blue-600 p-2 rounded hover:bg-blue-500">
            Reveal Quests
          </button>
          {error && <p className="text-red-400">{error}</p>}
        </form>
      </div>
    );
  }

  // 2. The Scrollable Quest Dialogue Board
  return (
    <div className="flex flex-col items-center p-8 bg-slate-900 text-white min-h-screen">
      <div className="flex justify-between w-full max-w-md mb-4">
        <h2 className="text-2xl font-bold">Active Quests</h2>
        <button onClick={logout} className="text-sm underline text-slate-400">Clear Session</button>
      </div>
      
      {/* Scrollable Dialogue Container */}
      <div 
        className="w-full max-w-md bg-slate-800 border-2 border-slate-600 rounded p-4 overflow-y-auto"
        style={{ maxHeight: '400px' }}
      >
        <ul className="space-y-4">
          {quests.map(quest => (
            <li key={quest.id} className="p-3 bg-slate-700 rounded shadow">
              <div className="flex items-center justify-between">
                <span>{quest.title}</span>
                <span className={quest.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}>
                  {quest.status === 'completed' ? '✓' : '!'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}