import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <span style={styles.ghostIcon}>👻</span>
        <span style={styles.title}>Quest Board</span>
      </div>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/admin" style={styles.link}>Admin Portal</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: 'rgba(15, 15, 25, 0.85)',
    borderBottom: '2px solid rgba(138, 43, 226, 0.4)', // Ethereal purple accent
    boxShadow: '0 4px 25px rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    color: '#f0f0f5',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontWeight: 'bold',
    fontSize: '1.25rem',
    letterSpacing: '1px',
  },
  ghostIcon: {
    fontSize: '1.5rem',
    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))',
  },
  title: {
    background: 'linear-gradient(90deg, #ffffff, #b19cd9)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  links: {
    display: 'flex',
    gap: '1.5rem',
  },
  link: {
    color: '#c5c5d2',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s ease',
  },
};