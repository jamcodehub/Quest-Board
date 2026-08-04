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
    <div style={styles.root}>

      {/* --- MOBILE TOP BAR --- */}
      <div style={styles.mobileTopBar} className="mobile-only">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={styles.hamburger}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
        <span style={styles.mobileBrand}>Quest Board</span>
        <span />
      </div>

      {/* --- SIDEBAR --- */}
      <aside style={{
        ...styles.sidebar,
        transform: mobileMenuOpen ? 'translateX(0)' : undefined,
      }} className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>

        {/* Brand */}
        <div style={styles.brandBlock}>
          <div style={styles.brandTitle}>Quest Board</div>
          <div style={styles.brandSub}>Progress &amp; Task Tracker</div>
        </div>

        <hr style={styles.divider} />

        {/* Campaign-style meta block */}
        <div style={styles.metaBlock}>
          <div style={styles.metaLabel}>SESSION</div>
          <div style={styles.campaignName}>Active Session</div>
          <div style={styles.metaRow}>
            <span style={styles.metaKey}>Gold Earned</span>
            <span style={styles.metaVal}>120</span>
          </div>
          <div style={styles.metaRow}>
            <span style={styles.metaKey}>Experience</span>
            <span style={styles.metaVal}>450 / 600</span>
          </div>
        </div>

        <hr style={styles.divider} />

        {/* Nav */}
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              })}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Hidden Guild Master — ultra-subtle, bottom of sidebar */}
        <div style={styles.sidebarFooter}>
          <span style={styles.version}>v1.2.0</span>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/admin');
            }}
            style={styles.guildMasterBtn}
            title="Guild Master Portal"
          >
            guild master
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          style={styles.overlay}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* --- MAIN CONTENT --- */}
      <main style={styles.main}>
        <div style={styles.mainInner}>
          {children}
        </div>
      </main>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #FAFAF7; }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            top: 0; left: 0; bottom: 0;
            transform: translateX(-100%) !important;
            z-index: 50;
            transition: transform 0.2s ease;
          }
          .sidebar.open {
            transform: translateX(0) !important;
          }
          .mobile-only {
            display: flex !important;
          }
          .main-desktop-pad {
            padding-top: 56px !important;
          }
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
    display: 'flex',
    height: '100vh',
    background: '#FAFAF7',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
  },
  mobileTopBar: {
    display: 'none',
    position: 'fixed',
    top: 0, left: 0, right: 0,
    height: 56,
    background: '#F5F2EA',
    borderBottom: '1px solid #E0D9CC',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    zIndex: 60,
  },
  hamburger: {
    background: 'none',
    border: 'none',
    fontSize: 18,
    color: '#5C4A2A',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  mobileBrand: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontWeight: 700,
    fontSize: 16,
    color: '#2C2416',
    letterSpacing: '0.02em',
  },
  sidebar: {
    width: 240,
    minWidth: 240,
    background: 'linear-gradient(180deg, #F5F2EA 0%, #F0EBE0 100%)',
    borderRight: '1px solid #E0D9CC',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflowY: 'auto',
    flexShrink: 0,
  },
  brandBlock: {
    padding: '28px 20px 20px',
  },
  brandTitle: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontWeight: 700,
    fontSize: 20,
    color: '#2C2416',
    letterSpacing: '0.01em',
    marginBottom: 4,
  },
  brandSub: {
    fontSize: 11,
    color: '#8B7355',
    letterSpacing: '0.02em',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #E0D9CC',
    margin: '0 20px',
  },
  metaBlock: {
    padding: '16px 20px',
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: '#A89070',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  campaignName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#3D2E14',
    marginBottom: 10,
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  metaKey: {
    fontSize: 11,
    color: '#8B7355',
  },
  metaVal: {
    fontSize: 11,
    fontWeight: 600,
    color: '#3D2E14',
    fontVariantNumeric: 'tabular-nums',
  },
  nav: {
    padding: '12px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  navLink: {
    display: 'block',
    padding: '8px 10px',
    borderRadius: 6,
    fontSize: 13,
    color: '#5C4A2A',
    textDecoration: 'none',
    fontWeight: 400,
    transition: 'background 0.15s, color 0.15s',
  },
  navLinkActive: {
    background: '#EDE7D9',
    color: '#2C2416',
    fontWeight: 600,
  },
  sidebarFooter: {
    padding: '12px 20px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #E0D9CC',
  },
  version: {
    fontSize: 10,
    color: '#C5BFB0',
    fontVariantNumeric: 'tabular-nums',
  },
  // Ultra-subtle — nearly invisible unless you look for it
  guildMasterBtn: {
    background: 'none',
    border: 'none',
    fontSize: 10,
    color: '#C8C2B6',
    cursor: 'pointer',
    padding: '2px 4px',
    letterSpacing: '0.04em',
    fontFamily: 'inherit',
    transition: 'color 0.2s',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.3)',
    zIndex: 40,
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    background: '#FAFAF7',
    display: 'flex',
    flexDirection: 'column',
  },
  mainInner: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100%',
  },
};
