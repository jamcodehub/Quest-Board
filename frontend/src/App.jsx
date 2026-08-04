import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Shell from './components/Shell.jsx';
import GhostDialogue from './components/GhostDialogue.jsx';

// ─── SHARED STYLES ───────────────────────────────────────────────────────────
const s = {
  pageWrap: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '40px 48px',
    maxWidth: 720,
  },
  pageTitle: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 22,
    fontWeight: 700,
    color: '#2C2416',
    marginBottom: 6,
    letterSpacing: '0.01em',
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#8B7355',
    marginBottom: 32,
  },
  card: {
    background: '#FFFFFF',
    border: '1px solid #E8E3D8',
    borderRadius: 8,
    padding: '28px 28px',
    maxWidth: 420,
  },
  label: {
    display: 'block',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#A89070',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    fontSize: 13,
    border: '1px solid #DDD7CC',
    borderRadius: 6,
    outline: 'none',
    background: '#FAFAF7',
    color: '#2C2416',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  },
  btn: {
    display: 'inline-block',
    padding: '9px 20px',
    background: '#7D6340',
    color: '#FFFDF9',
    fontSize: 12,
    fontWeight: 600,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    letterSpacing: '0.03em',
    transition: 'background 0.15s',
  },
  errorText: {
    fontSize: 11,
    color: '#B85C38',
    marginTop: 8,
  },
  successText: {
    fontSize: 11,
    color: '#4A7C59',
    marginTop: 8,
  },
};

// ─── QUESTS PORTAL ───────────────────────────────────────────────────────────
function QuestsPortal() {
  const [code, setCode] = useState('');
  const [activeQuests, setActiveQuests] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedCode = localStorage.getItem('activeQuestCode');
    if (savedCode) fetchQuests(savedCode);
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
        setError('Invalid quest code. Verify with your instructor.');
        localStorage.removeItem('activeQuestCode');
      }
    } catch {
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

  if (!activeQuests) {
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
              onMouseEnter={e => e.target.style.background = '#6B5232'}
              onMouseLeave={e => e.target.style.background = '#7D6340'}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
        <div style={s.pageTitle}>Active Quests</div>
        <button
          onClick={logout}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 11,
            color: '#A89070',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontFamily: 'inherit',
          }}
        >
          Switch Code
        </button>
      </div>
      <GhostDialogue quests={activeQuests} />
    </div>
  );
}

// ─── ADMIN PORTAL ─────────────────────────────────────────────────────────────
function AdminPortal() {
  const [adminPassword, setAdminPassword] = useState('');
  const [tasksInput, setTasksInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCreateQuests = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setGeneratedCode('');
    setIsSuccess(false);

    const tasksArray = tasksInput.split('\n').map(t => t.trim()).filter(t => t.length > 0);
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
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ tasks: tasksArray }),
      });

      const data = await response.json();
      if (response.ok) {
        setGeneratedCode(data.questCode);
        setStatusMessage('Quest board created successfully.');
        setIsSuccess(true);
        setTasksInput('');
      } else {
        setStatusMessage(data.message || 'Authorization failed.');
      }
    } catch {
      setStatusMessage('Network error connecting to backend.');
    }
  };

  return (
    <div style={s.pageWrap}>
      <div style={s.pageTitle}>Guild Master Portal</div>
      <div style={s.pageSubtitle}>Create a new quest board and generate a code for your students.</div>

      <div style={{ ...s.card, maxWidth: 480 }}>
        <form onSubmit={handleCreateQuests}>
          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>Admin Password</label>
            <input
              style={s.input}
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>Tasks (one per line)</label>
            <textarea
              rows={5}
              placeholder={"Complete Module 1 Quiz\nSubmit GitHub repository link\nReview error handling code"}
              style={{
                ...s.input,
                resize: 'vertical',
                fontFamily: '"SF Mono", "Fira Code", monospace',
                lineHeight: 1.6,
              }}
              value={tasksInput}
              onChange={(e) => setTasksInput(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            style={{ ...s.btn, width: '100%', textAlign: 'center' }}
            onMouseEnter={e => e.target.style.background = '#6B5232'}
            onMouseLeave={e => e.target.style.background = '#7D6340'}
          >
            Generate Quest Code
          </button>
        </form>

        {statusMessage && (
          <div style={isSuccess ? s.successText : s.errorText}>{statusMessage}</div>
        )}

        {generatedCode && (
          <div style={{
            marginTop: 20,
            padding: '14px 16px',
            background: '#F5F2EA',
            border: '1px solid #E0D9CC',
            borderRadius: 6,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A89070', marginBottom: 6 }}>
              Generated Code
            </div>
            <div style={{
              fontFamily: '"SF Mono", "Fira Code", monospace',
              fontSize: 16,
              fontWeight: 700,
              color: '#2C2416',
              userSelect: 'all',
            }}>
              {generatedCode}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PLACEHOLDER ──────────────────────────────────────────────────────────────
function PlaceholderPage({ title }) {
  return (
    <div style={s.pageWrap}>
      <div style={s.pageTitle}>{title}</div>
      <div style={s.pageSubtitle}>This section is currently empty.</div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
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
