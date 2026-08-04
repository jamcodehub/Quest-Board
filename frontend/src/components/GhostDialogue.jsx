import React, { useState } from 'react';

export default function GhostDialogue() {
  const [code, setCode] = useState('');
  const [activeQuests, setActiveQuests] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/quests/${code}`);
      if (response.ok) {
        const data = await response.json();
        setActiveQuests(data);
      } else {
        alert('Code not found.');
      }
    } catch (error) {
      console.error('Network error', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      {!activeQuests ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="Enter Quest Code..."
            className="p-2 text-black rounded"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 p-2 rounded">Enter</button>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Active Quests</h2>
          {/* renders the data here */}
          <pre className="bg-slate-800 p-4 rounded">{JSON.stringify(activeQuests, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}