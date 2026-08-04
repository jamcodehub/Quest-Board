import React, { useState } from 'react';

export default function GhostDialogue({ quests }) {
  const [checked, setChecked] = useState({});

  if (!quests) return null;

  // Support both array of strings and array of objects with .task field
  const tasks = Array.isArray(quests)
    ? quests
    : quests.tasks || [];

  const toggle = (idx) => {
    setChecked(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const completedCount = tasks.filter((_, i) => checked[i]).length;

  return (
    <div style={styles.wrap}>
      {/* Progress header */}
      <div style={styles.progressHeader}>
        <span style={styles.progressLabel}>
          {completedCount} of {tasks.length} completed
        </span>
        <div style={styles.progressBarWrap}>
          <div
            style={{
              ...styles.progressBarFill,
              width: tasks.length > 0 ? `${(completedCount / tasks.length) * 100}%` : '0%',
            }}
          />
        </div>
      </div>

      {/* Task list */}
      <div style={styles.taskList}>
        {tasks.length === 0 && (
          <div style={styles.emptyState}>No tasks assigned yet.</div>
        )}
        {tasks.map((task, idx) => {
          const label = typeof task === 'string' ? task : task.task || task.title || JSON.stringify(task);
          const done = !!checked[idx];
          return (
            <button
              key={idx}
              onClick={() => toggle(idx)}
              style={{
                ...styles.taskRow,
                ...(done ? styles.taskRowDone : {}),
              }}
            >
              <span style={{ ...styles.checkbox, ...(done ? styles.checkboxDone : {}) }}>
                {done && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4.5 7.5L8.5 3" stroke="#FFFDF9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span style={{
                ...styles.taskLabel,
                ...(done ? styles.taskLabelDone : {}),
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  progressHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: '#8B7355',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    minWidth: 120,
  },
  progressBarWrap: {
    flex: 1,
    height: 4,
    background: '#E8E3D8',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    background: '#7D6340',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  taskRow: {
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
    transition: 'background 0.12s, border-color 0.12s',
    fontFamily: 'inherit',
  },
  taskRowDone: {
    background: '#F5F2EA',
    borderColor: '#DDD7CC',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    border: '1.5px solid #C8C2B6',
    background: '#FAFAF7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 0.12s, border-color 0.12s',
  },
  checkboxDone: {
    background: '#7D6340',
    borderColor: '#7D6340',
  },
  taskLabel: {
    fontSize: 13,
    color: '#2C2416',
    lineHeight: 1.4,
  },
  taskLabelDone: {
    color: '#A89070',
    textDecoration: 'line-through',
  },
  emptyState: {
    fontSize: 12,
    color: '#A89070',
    padding: '20px 0',
    textAlign: 'center',
  },
};
