import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export default function Shell({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  // Fetch profile stats for sidebar display
  useEffect(() => {
    const code = localStorage.getItem('activeQuestCode');
    if (!code) return;
    fetch(`${API}/api/quests/${code}`)
      .then(r => r.json())
      .then(data => setProfile(data))
      .catch(() => {});

    // Re-fetch when storage changes (e.g. login/logout)
    const onStorage = () => {
      const c = localStorage.getItem('activeQuestCode');
      if (c) {
        fetch(`${API}/api/quests/${c}`).then(r => r.json()).then(setProfile).catch(() => {});
      } else {
        setProfile(null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const navItems = [
    { name: 'Quests',    path: '/',          emoji: '📋' },
    { name: 'Character', path: '/character', emoji: '⚔️' },
    { name: 'Shop',      path: '/shop',      emoji: '🏪' },
  ];

  const xpPct = profile
    ? Math.min(100, Math.round(
        ((profile.xp - (profile.xpForCurrentLevel || 0)) /
        ((profile.xpForNextLevel || 200) - (profile.xpForCurrentLevel || 0))) * 100
      ))
    : 0;

  return (
    <div style={styles.root}>
      {/* ── MOBILE TOP BAR ── */}
      <div style={styles.mobileTopBar} className="mobile-only">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={styles.hamburger}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
        <span style={styles.mobileBrand}>Quest Board</span>
        <span />
      </div>

      {/* ── SIDEBAR ── */}
      <aside
        style={styles.sidebar}
        className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}
      >
        {/* Brand */}
        <div style={styles.brandBlock}>
          <div style={styles.brandTitle}>Quest Board</div>
          <div style={styles.brandSub}>Progress &amp; Task Tracker</div>
        </div>

        <hr style={styles.divider} />

        {/* Session stats */}
        <div style={styles.metaBlock}>
          <div style={styles.metaLabel}>Session</div>

          {profile ? (
            <>
              <div style={styles.levelRow}>
                <span style={styles.levelBadge}>Lv.{profile.level}</span>
                <span style={styles.metaKey}>
                  {profile.equipped?.title
                    ? <span style={{ color: '#7D6340', fontWeight: 600, fontSize: 11 }}>
                        {profile.equipped.title.replace('title_', '').replace('_', ' ')}
                      </span>
                    : <span style={{ color: '#C8C2B6' }}>No title</span>
                  }
                </span>
              </div>

              {/* XP bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={styles.xpRow}>
                  <span style={styles.metaKey}>XP</span>
                  <span style={styles.metaVal}>{profile.xp}</span>
                </div>
                <div style={styles.xpBarWrap}>
                  <div style={{ ...styles.xpBarFill, width: `${xpPct}%` }} />
                </div>
              </div>

              <div style={styles.metaRow}>
                <span style={styles.metaKey}>Gold</span>
                <span style={{ ...styles.metaVal, color: '#92610A' }}>🪙 {profile.gold}g</span>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 11, color: '#C8C2B6' }}>No quest loaded</div>
          )}
        </div>

        <hr style={styles.divider} />

        {/* Nav */}
        <nav style={styles.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              })}
            >
              <span style={styles.navEmoji}>{item.emoji}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Footer — Guild Master ultra-subtle */}
        <div style={styles.sidebarFooter}>
          <span style={styles.version}>v1.3.0</span>
          <button
            onClick={() => { setMobileMenuOpen(false); navigate('/admin'); }}
            style={styles.guildMasterBtn}
            title="Guild Master Portal"
          >
            guild master
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div style={styles.overlay} onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* ── MAIN ── */}
      <main style={styles.main}>
        {children}
      </main>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #FAFAF7; }
        @media (max-width: 768px) {
          .sidebar { position: fixed !important; top: 0; left: 0; bottom: 0; transform: translateX(-100%) !important; z-index: 50; transition: transform 0.2s ease; }
          .sidebar.open { transform: translateX(0) !important; }
          .mobile-only { display: flex !important; }
          main { padding-top: 56px; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
          .sidebar { transform: none !important; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    display: 'flex', height: '100vh',
    background: '#FAFAF7',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
  },
  mobileTopBar: {
    display: 'none', position: 'fixed',
    top: 0, left: 0, right: 0, height: 56,
    background: '#F5F2EA', borderBottom: '1px solid #E0D9CC',
    alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', zIndex: 60,
  },
  hamburger: { background: 'none', border: 'none', fontSize: 18, color: '#5C4A2A', cursor: 'pointer', padding: '4px 8px' },
  mobileBrand: { fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 16, color: '#2C2416' },
  sidebar: {
    width: 240, minWidth: 240,
    background: 'linear-gradient(180deg, #F5F2EA 0%, #F0EBE0 100%)',
    borderRight: '1px solid #E0D9CC',
    display: 'flex', flexDirection: 'column',
    height: '100vh', overflowY: 'auto', flexShrink: 0,
  },
  brandBlock: { padding: '28px 20px 20px' },
  brandTitle: { fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 20, color: '#2C2416', marginBottom: 4 },
  brandSub: { fontSize: 11, color: '#8B7355' },
  divider: { border: 'none', borderTop: '1px solid #E0D9CC', margin: '0 20px' },
  metaBlock: { padding: '16px 20px' },
  metaLabel: { fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#A89070', textTransform: 'uppercase', marginBottom: 10 },
  levelRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  levelBadge: { fontSize: 11, fontWeight: 700, padding: '2px 8px', background: '#7D6340', color: '#FFFDF9', borderRadius: 4 },
  metaRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  metaKey: { fontSize: 11, color: '#8B7355' },
  metaVal: { fontSize: 11, fontWeight: 600, color: '#3D2E14', fontVariantNumeric: 'tabular-nums' },
  xpRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 },
  xpBarWrap: { height: 4, background: '#E0D9CC', borderRadius: 2, overflow: 'hidden' },
  xpBarFill: { height: '100%', background: '#7D6340', borderRadius: 2, transition: 'width 0.5s ease' },
  nav: { padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 2 },
  navLink: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 10px', borderRadius: 6,
    fontSize: 13, color: '#5C4A2A', textDecoration: 'none',
    fontWeight: 400, transition: 'background 0.15s, color 0.15s',
  },
  navLinkActive: { background: '#EDE7D9', color: '#2C2416', fontWeight: 600 },
  navEmoji: { fontSize: 14 },
  sidebarFooter: {
    padding: '12px 20px 20px', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center',
    borderTop: '1px solid #E0D9CC',
  },
  version: { fontSize: 10, color: '#C5BFB0', fontVariantNumeric: 'tabular-nums' },
  guildMasterBtn: {
    background: 'none', border: 'none', fontSize: 10,
    color: '#C8C2B6', cursor: 'pointer', padding: '2px 4px',
    letterSpacing: '0.04em', fontFamily: 'inherit', transition: 'color 0.2s',
  },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40 },
  main: { flex: 1, overflowY: 'auto', background: '#FAFAF7', display: 'flex', flexDirection: 'column' },
};
