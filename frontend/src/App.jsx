import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Shell from './components/Shell.jsx';
import QuestList from './components/QuestList.jsx';
import Character from './pages/Character.jsx';
import Shop from './pages/Shop.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:10000';

// ─── QUESTS PORTAL ─────────────────────────────────────────────────────────────
function QuestsPortal() {
  const [code, setCode] = useState('');
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('activeQuestCode');
    if (saved) fetchProfile(saved);
  }, []);

  const fetchProfile = async (questCode) => {
    setError('');
    try {
      const res = await fetch(`${API}/api/quests/${questCode}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        localStorage.setItem('activeQuestCode', questCode);
      } else {
        setError('Invalid quest code. Verify with your instructor.');
        localStorage.removeItem('activeQuestCode');
      }
    } catch {
      setError('Unable to connect to server.');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetchProfile(code);
  };

  const logout = () => {
    localStorage.removeItem('activeQuestCode');
    setProfile(null);
    setCode('');
  };

  // Called by GhostDialogue after a task is completed to refresh stats in sidebar
  const handleProgressUpdate = useCallback(() => {
    const saved = localStorage.getItem('activeQuestCode');
    if (saved) fetchProfile(saved);
  }, []);

  if (!profile) {
    return (
      <div style={s.pageWrap}>
        <div style={s.pageTitle}>Quests</div>
        <div style={s.pageSubtitle}>Enter your quest code to load your active checklist.</div>
        <div style={s.card}>
          <form onSubmit={handleLogin}>
            <label style={s.label}>Quest Code</label>
            <input
              style={s.input}
              type="text"
              placeholder="e.g. crimson-dragon-42"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            {error && <div style={s.errorText}>{error}</div>}
            <button
              type="submit"
              style={{ ...s.btn, marginTop: 16, width: '100%', textAlign: 'center' }}
            >
              Load Quests
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...s.pageWrap, maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={s.pageTitle}>Quests</div>
        <button onClick={logout} style={s.switchBtn}>Switch Code</button>
      </div>

      {/* Live stats bar */}
      <div style={s.statsBar}>
        <StatPill label="Level" value={profile.level} />
        <StatPill label="XP" value={`${profile.xp}`} accent />
        <StatPill label="Gold" value={`${profile.gold}g`} gold />
        <div style={s.xpMiniBarWrap}>
          <div style={{
            ...s.xpMiniBarFill,
            width: `${Math.min(100, Math.round(((profile.xp - (profile.xpForCurrentLevel || 0)) / ((profile.xpForNextLevel || 200) - (profile.xpForCurrentLevel || 0))) * 100))}%`,
          }} />
        </div>
      </div>

      <GhostDialogue
        quests={profile}
        questCode={profile.questCode}
        onProgressUpdate={handleProgressUpdate}
      />
    </div>
  );
}

function StatPill({ label, value, accent, gold: isGold }) {
  return (
    <div style={{
      ...s.pill,
      ...(isGold ? s.pillGold : accent ? s.pillAccent : {}),
    }}>
      <span style={s.pillLabel}>{label}</span>
      <span style={s.pillVal}>{value}</span>
    </div>
  );
}

// ─── ADMIN PORTAL ──────────────────────────────────────────────────────────────
function AdminPortal() {
  const [adminPassword, setAdminPassword] = useState('');
  const [tasks, setTasks] = useState([{ title: '', xpReward: 50, goldReward: 20 }]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const addTask = () => setTasks(prev => [...prev, { title: '', xpReward: 50, goldReward: 20 }]);
  const removeTask = (i) => setTasks(prev => prev.filter((_, idx) => idx !== i));
  const updateTask = (i, field, val) => setTasks(prev =>
    prev.map((t, idx) => idx === i ? { ...t, [field]: val } : t)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setGeneratedCode('');
    setIsSuccess(false);

    const valid = tasks.filter(t => t.title.trim());
    if (!valid.length) { setStatusMessage('Add at least one task.'); return; }

    try {
      const res = await fetch(`${API}/api/admin/quests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ tasks: valid }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedCode(data.questCode);
        setStatusMessage('Quest board created!');
        setIsSuccess(true);
        setTasks([{ title: '', xpReward: 50, goldReward: 20 }]);
      } else {
        setStatusMessage(data.message || 'Authorization failed.');
      }
    } catch {
      setStatusMessage('Network error.');
    }
  };

  return (
    <div style={s.pageWrap}>
      <div style={s.pageTitle}>Guild Master Portal</div>
      <div style={s.pageSubtitle}>Create quest boards and set XP/Gold rewards per task.</div>

      <div style={{ ...s.card, maxWidth: 560 }}>
        <form onSubmit={handleSubmit}>
          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>Admin Password</label>
            <input
              style={s.input}
              type="password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              required
            />
          </div>

          {/* Tasks */}
          <div style={{ marginBottom: 16 }}>
            <label style={s.label}>Tasks & Rewards</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tasks.map((task, i) => (
                <div key={i} style={s.taskRow}>
                  <input
                    style={{ ...s.input, flex: 1, marginBottom: 0 }}
                    placeholder={`Task ${i + 1}...`}
                    value={task.title}
                    onChange={e => updateTask(i, 'title', e.target.value)}
                  />
                  <div style={s.rewardInputs}>
                    <label style={s.rewardLabel}>XP</label>
                    <input
                      style={s.rewardInput}
                      type="number"
                      min={0}
                      value={task.xpReward}
                      onChange={e => updateTask(i, 'xpReward', Number(e.target.value))}
                    />
                    <label style={s.rewardLabel}>Gold</label>
                    <input
                      style={s.rewardInput}
                      type="number"
                      min={0}
                      value={task.goldReward}
                      onChange={e => updateTask(i, 'goldReward', Number(e.target.value))}
                    />
                  </div>
                  {tasks.length > 1 && (
                    <button type="button" onClick={() => removeTask(i)} style={s.removeBtn}>✕</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addTask} style={s.addBtn}>+ Add Task</button>
          </div>

          <button type="submit" style={{ ...s.btn, width: '100%', textAlign: 'center' }}>
            Generate Quest Code
          </button>
        </form>

        {statusMessage && (
          <div style={isSuccess ? s.successText : s.errorText}>{statusMessage}</div>
        )}

        {generatedCode && (
          <div style={s.codeBox}>
            <div style={s.codeLabel}>Generated Code</div>
            <div style={s.codeValue}>{generatedCode}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Router>
      <Shell>
        <Routes>
          <Route path="/" element={<QuestsPortal />} />
          <Route path="/character" element={<Character />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/admin" element={<AdminPortal />} />
        </Routes>
      </Shell>
    </Router>
  );
}

// ─── SHARED STYLES ─────────────────────────────────────────────────────────────
const s = {
  pageWrap: { padding: '40px 48px', maxWidth: 720, display: 'flex', flexDirection: 'column' },
  pageTitle: { fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: '#2C2416', marginBottom: 6, letterSpacing: '0.01em' },
  pageSubtitle: { fontSize: 12, color: '#8B7355', marginBottom: 28 },
  card: { background: '#FFFFFF', border: '1px solid #E8E3D8', borderRadius: 8, padding: '24px 24px' },
  label: { display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A89070', marginBottom: 6 },
  input: { width: '100%', padding: '9px 12px', fontSize: 13, border: '1px solid #DDD7CC', borderRadius: 6, outline: 'none', background: '#FAFAF7', color: '#2C2416', fontFamily: 'inherit', boxSizing: 'border-box' },
  btn: { display: 'inline-block', padding: '9px 20px', background: '#7D6340', color: '#FFFDF9', fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.03em' },
  errorText: { fontSize: 11, color: '#B85C38', marginTop: 10 },
  successText: { fontSize: 11, color: '#4A7C59', marginTop: 10 },
  switchBtn: { background: 'none', border: 'none', fontSize: 11, color: '#A89070', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' },
  statsBar: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  pill: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 12px', background: '#F5F2EA', border: '1px solid #E8E3D8', borderRadius: 6, minWidth: 52 },
  pillAccent: { background: '#EDE7D9', borderColor: '#C8C2B6' },
  pillGold: { background: '#FEF3C7', borderColor: '#F6D860' },
  pillLabel: { fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A89070' },
  pillVal: { fontSize: 15, fontWeight: 700, color: '#2C2416', fontVariantNumeric: 'tabular-nums' },
  xpMiniBarWrap: { flex: 1, height: 5, background: '#E8E3D8', borderRadius: 3, overflow: 'hidden', minWidth: 80 },
  xpMiniBarFill: { height: '100%', background: '#7D6340', borderRadius: 3, transition: 'width 0.4s ease' },
  taskRow: { display: 'flex', alignItems: 'center', gap: 8 },
  rewardInputs: { display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 },
  rewardLabel: { fontSize: 10, color: '#A89070', fontWeight: 600, whiteSpace: 'nowrap' },
  rewardInput: { width: 54, padding: '9px 6px', fontSize: 12, border: '1px solid #DDD7CC', borderRadius: 6, outline: 'none', background: '#FAFAF7', color: '#2C2416', fontFamily: 'inherit', textAlign: 'center' },
  removeBtn: { background: 'none', border: 'none', color: '#C8C2B6', fontSize: 13, cursor: 'pointer', padding: '0 4px', flexShrink: 0 },
  addBtn: { marginTop: 8, background: 'none', border: '1px dashed #C8C2B6', color: '#8B7355', fontSize: 11, padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', width: '100%' },
  codeBox: { marginTop: 16, padding: '14px 16px', background: '#F5F2EA', border: '1px solid #E0D9CC', borderRadius: 6, textAlign: 'center' },
  codeLabel: { fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A89070', marginBottom: 6 },
  codeValue: { fontFamily: '"SF Mono", "Fira Code", monospace', fontSize: 16, fontWeight: 700, color: '#2C2416', userSelect: 'all' },
};
