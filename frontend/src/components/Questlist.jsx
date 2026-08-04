import React, { useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export default function GhostDialogue({ quests: initialData, questCode, onProgressUpdate }) {
  const [quests, setQuests] = useState(initialData?.quests || []);
  const [pendingId, setPendingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = '#4A7C59') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  const handleToggle = async (quest) => {
    if (pendingId) return;
    setPendingId(quest._id);

    const endpoint = quest.status === 'completed'
      ? `/api/quests/${questCode}/uncomplete/${quest._id}`
      : `/api/quests/${questCode}/complete/${quest._id}`;

    try {
      const res = await fetch(`${API}${endpoint}`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || 'Error', '#B85C38');
        setPendingId(null);
        return;
      }

      // Update local quest status
      setQuests(prev =>
        prev.map(q =>
          q._id === quest._id
            ? { ...q, status: quest.status === 'completed' ? 'pending' : 'completed' }
            : q
        )
      );

      if (quest.status === 'pending') {
        const msg = data.leveledUp
          ? `⬆️ Level Up! +${data.xpGained} XP, +${data.goldGained} Gold`
          : `+${data.xpGained} XP  +${data.goldGained} Gold`;
        showToast(msg, data.leveledUp ? '#7D6340' : '#4A7C59');
      }

      // Notify parent to refresh stats
      if (onProgressUpdate) onProgressUpdate();
    } catch {
      showToast('Connection error', '#B85C38');
    }

    setPendingId(null);
  };

  const completed = quests.filter(q => q.status === 'completed').length;
  const total = quests.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div style={s.wrap}>
      {/* Toast */}
      {toast && (
        <div style={{ ...s.toast, background: toast.color }}>
          {toast.msg}
        </div>
      )}

      {/* Progress bar */}
      <div style={s.progressRow}>
        <span style={s.progressLabel}>{completed} / {total} completed</span>
        <div style={s.barWrap}>
          <div style={{ ...s.barFill, width: `${pct}%` }} />
        </div>
        <span style={s.pct}>{Math.round(pct)}%</span>
      </div>

      {/* Quest list */}
      <div style={s.list}>
        {quests.map(quest => {
          const done = quest.status === 'completed';
          const loading = pendingId === quest._id;
          return (
            <button
              key={quest._id}
              onClick={() => handleToggle(quest)}
              disabled={!!pendingId}
              style={{
                ...s.row,
                ...(done ? s.rowDone : {}),
                ...(loading ? s.rowLoading : {}),
              }}
            >
              {/* Checkbox */}
              <span style={{ ...s.checkbox, ...(done ? s.checkboxDone : {}) }}>
                {loading ? (
                  <span style={s.spinner} />
                ) : done ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4.5 7.5L8.5 3" stroke="#FFFDF9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </span>

              {/* Task title */}
              <span style={{ ...s.title, ...(done ? s.titleDone : {}) }}>
                {quest.title}
              </span>

              {/* Rewards */}
              <span style={s.rewards}>
                <span style={s.xpBadge}>+{quest.xpReward} XP</span>
                <span style={s.goldBadge}>+{quest.goldReward}g</span>
              </span>
            </button>
          );
        })}

        {quests.length === 0 && (
          <div style={s.empty}>No quests assigned yet.</div>
        )}
      </div>
    </div>
  );
}

const s = {
  wrap: { position: 'relative', display: 'flex', flexDirection: 'column', gap: 16 },
  toast: {
    position: 'fixed',
    bottom: 28,
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    padding: '10px 22px',
    borderRadius: 8,
    zIndex: 999,
    pointerEvents: 'none',
    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
    whiteSpace: 'nowrap',
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  progressLabel: { fontSize: 11, color: '#8B7355', whiteSpace: 'nowrap', minWidth: 100 },
  barWrap: { flex: 1, height: 5, background: '#E8E3D8', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', background: '#7D6340', borderRadius: 3, transition: 'width 0.4s ease' },
  pct: { fontSize: 11, color: '#A89070', minWidth: 32, textAlign: 'right' },
  list: { display: 'flex', flexDirection: 'column', gap: 3 },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 14px',
    background: '#FFFFFF',
    border: '1px solid #E8E3D8',
    borderRadius: 7,
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'background 0.12s',
    fontFamily: 'inherit',
  },
  rowDone: { background: '#F5F2EA', borderColor: '#DDD7CC' },
  rowLoading: { opacity: 0.6 },
  checkbox: {
    width: 18, height: 18, borderRadius: 4,
    border: '1.5px solid #C8C2B6', background: '#FAFAF7',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'background 0.12s',
  },
  checkboxDone: { background: '#7D6340', borderColor: '#7D6340' },
  spinner: {
    width: 8, height: 8, borderRadius: '50%',
    border: '1.5px solid #C8C2B6',
    borderTopColor: '#7D6340',
    animation: 'spin 0.6s linear infinite',
    display: 'block',
  },
  title: { flex: 1, fontSize: 13, color: '#2C2416', lineHeight: 1.4 },
  titleDone: { color: '#A89070', textDecoration: 'line-through' },
  rewards: { display: 'flex', gap: 6, flexShrink: 0 },
  xpBadge: {
    fontSize: 10, fontWeight: 600, padding: '2px 7px',
    background: '#EDE7D9', color: '#7D6340', borderRadius: 4,
    fontVariantNumeric: 'tabular-nums',
  },
  goldBadge: {
    fontSize: 10, fontWeight: 600, padding: '2px 7px',
    background: '#FEF3C7', color: '#92610A', borderRadius: 4,
    fontVariantNumeric: 'tabular-nums',
  },
  empty: { fontSize: 12, color: '#A89070', padding: '20px 0', textAlign: 'center' },
};
