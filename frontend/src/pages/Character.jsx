import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export default function Character() {
  const [profile, setProfile] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const code = localStorage.getItem('activeQuestCode');
    if (!code) { setLoading(false); return; }
    Promise.all([
      fetch(`${API}/api/quests/${code}`).then(r => r.json()),
      fetch(`${API}/api/shop`).then(r => r.json()),
    ]).then(([profileData, shopData]) => {
      setProfile(profileData);
      setShopItems(Array.isArray(shopData) ? shopData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={s.page}><div style={s.muted}>Loading...</div></div>;
  if (!profile) return (
    <div style={s.page}>
      <div style={s.pageTitle}>Character</div>
      <div style={s.muted}>Load a quest code first to see your character.</div>
    </div>
  );

  const itemMap = Object.fromEntries(shopItems.map(i => [i.id, i]));
  const xpIntoLevel = profile.xp - (profile.xpForCurrentLevel || 0);
  const xpNeeded = (profile.xpForNextLevel || 200) - (profile.xpForCurrentLevel || 0);
  const xpPct = Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100));

  const equippedSlots = [
    { key: 'weapon',    label: 'Weapon',    empty: '🗡️' },
    { key: 'armor',     label: 'Armor',     empty: '🛡️' },
    { key: 'companion', label: 'Companion', empty: '👤' },
    { key: 'title',     label: 'Title',     empty: '📜' },
  ];

  const titleItem = profile.equipped?.title ? itemMap[profile.equipped.title] : null;

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Character</div>
      <div style={s.pageSubtitle}>Your stats, equipped gear, and inventory.</div>

      <div style={s.grid}>
        {/* ── Left: Stats card ── */}
        <div style={s.card}>
          {/* Avatar */}
          <div style={s.avatarWrap}>
            <div style={s.avatar}>
              {profile.equipped?.companion
                ? <span style={s.avatarEmoji}>{itemMap[profile.equipped.companion]?.emoji || '👤'}</span>
                : <span style={s.avatarEmoji}>⚔️</span>}
            </div>
            <div style={s.avatarInfo}>
              <div style={s.charName}>
                {titleItem ? (
                  <span style={s.titleBadge}>{titleItem.emoji} {titleItem.name}</span>
                ) : (
                  <span style={s.muted}>No title equipped</span>
                )}
              </div>
              <div style={s.levelLabel}>Level {profile.level}</div>
            </div>
          </div>

          <div style={s.divider} />

          {/* XP bar */}
          <div style={s.statBlock}>
            <div style={s.statRow}>
              <span style={s.statKey}>Experience</span>
              <span style={s.statVal}>{profile.xp} XP</span>
            </div>
            <div style={s.xpBarWrap}>
              <div style={{ ...s.xpBarFill, width: `${xpPct}%` }} />
            </div>
            <div style={s.xpSub}>{xpPct}% to Level {profile.level + 1}</div>
          </div>

          {/* Gold */}
          <div style={s.statBlock}>
            <div style={s.statRow}>
              <span style={s.statKey}>Gold</span>
              <span style={{ ...s.statVal, color: '#92610A' }}>🪙 {profile.gold}g</span>
            </div>
          </div>

          {/* Power-ups */}
          {profile.powerups && (
            <div style={s.statBlock}>
              <div style={{ ...s.sectionLabel, marginBottom: 8 }}>Power-up Tokens</div>
              <div style={s.powerupRow}>
                <Token emoji="💡" label="Hints" count={profile.powerups.hint || 0} />
                <Token emoji="📅" label="Extra Days" count={profile.powerups.extraDay || 0} />
                <Token emoji="🎲" label="Re-rolls" count={profile.powerups.reroll || 0} />
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Equipped + Inventory ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Equipped */}
          <div style={s.card}>
            <div style={s.sectionLabel}>Equipped</div>
            <div style={s.equippedGrid}>
              {equippedSlots.map(slot => {
                const item = profile.equipped?.[slot.key]
                  ? itemMap[profile.equipped[slot.key]]
                  : null;
                return (
                  <div key={slot.key} style={s.slot}>
                    <div style={s.slotLabel}>{slot.label}</div>
                    <div style={{ ...s.slotBox, ...(item ? s.slotBoxFilled : {}) }}>
                      <span style={s.slotEmoji}>{item ? item.emoji : slot.empty}</span>
                    </div>
                    <div style={s.slotName}>{item ? item.name : <span style={s.muted}>Empty</span>}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inventory */}
          <div style={s.card}>
            <div style={s.sectionLabel}>Inventory ({profile.inventory?.length || 0} items)</div>
            {!profile.inventory?.length ? (
              <div style={{ ...s.muted, marginTop: 8 }}>No items yet. Visit the Shop!</div>
            ) : (
              <div style={s.inventoryList}>
                {profile.inventory.map(id => {
                  const item = itemMap[id];
                  if (!item) return null;
                  const isEquipped = Object.values(profile.equipped || {}).includes(id);
                  return (
                    <div key={id} style={s.invRow}>
                      <span style={s.invEmoji}>{item.emoji}</span>
                      <div style={s.invInfo}>
                        <span style={s.invName}>{item.name}</span>
                        <span style={s.invCat}>{item.category}</span>
                      </div>
                      {isEquipped && <span style={s.equippedTag}>Equipped</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Token({ emoji, label, count }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 4, padding: '8px 12px',
      background: count > 0 ? '#F5F2EA' : '#FAFAF7',
      border: '1px solid #E8E3D8', borderRadius: 6, minWidth: 64,
    }}>
      <span style={{ fontSize: 18 }}>{emoji}</span>
      <span style={{ fontSize: 16, fontWeight: 700, color: count > 0 ? '#2C2416' : '#C8C2B6', fontVariantNumeric: 'tabular-nums' }}>{count}</span>
      <span style={{ fontSize: 9, color: '#A89070', textAlign: 'center' }}>{label}</span>
    </div>
  );
}

const s = {
  page: { padding: '40px 48px', maxWidth: 900 },
  pageTitle: { fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: '#2C2416', marginBottom: 6 },
  pageSubtitle: { fontSize: 12, color: '#8B7355', marginBottom: 32 },
  grid: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, alignItems: 'start' },
  card: { background: '#FFFFFF', border: '1px solid #E8E3D8', borderRadius: 8, padding: '20px 20px' },
  divider: { border: 'none', borderTop: '1px solid #F0EBE0', margin: '16px 0' },
  avatarWrap: { display: 'flex', alignItems: 'center', gap: 14 },
  avatar: {
    width: 52, height: 52, borderRadius: 10,
    background: '#F5F2EA', border: '1px solid #E8E3D8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarEmoji: { fontSize: 26 },
  avatarInfo: { flex: 1 },
  charName: { fontSize: 13, fontWeight: 600, color: '#2C2416', marginBottom: 3 },
  levelLabel: { fontSize: 11, color: '#8B7355' },
  titleBadge: { fontSize: 12, color: '#7D6340', fontWeight: 600 },
  statBlock: { marginBottom: 16 },
  statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  statKey: { fontSize: 11, color: '#8B7355' },
  statVal: { fontSize: 13, fontWeight: 700, color: '#2C2416', fontVariantNumeric: 'tabular-nums' },
  xpBarWrap: { height: 6, background: '#E8E3D8', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  xpBarFill: { height: '100%', background: '#7D6340', borderRadius: 3, transition: 'width 0.5s ease' },
  xpSub: { fontSize: 10, color: '#A89070' },
  sectionLabel: { fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A89070', marginBottom: 12 },
  powerupRow: { display: 'flex', gap: 8 },
  equippedGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  slot: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  slotLabel: { fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A89070' },
  slotBox: {
    width: 52, height: 52, borderRadius: 8,
    background: '#FAFAF7', border: '1.5px dashed #E8E3D8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  slotBoxFilled: { background: '#F5F2EA', border: '1.5px solid #C8C2B6' },
  slotEmoji: { fontSize: 22 },
  slotName: { fontSize: 10, color: '#5C4A2A', textAlign: 'center' },
  inventoryList: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 },
  invRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 10px', background: '#FAFAF7',
    border: '1px solid #F0EBE0', borderRadius: 6,
  },
  invEmoji: { fontSize: 18, flexShrink: 0 },
  invInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 1 },
  invName: { fontSize: 12, fontWeight: 600, color: '#2C2416' },
  invCat: { fontSize: 10, color: '#A89070', textTransform: 'capitalize' },
  equippedTag: {
    fontSize: 9, fontWeight: 700, padding: '2px 7px',
    background: '#EDE7D9', color: '#7D6340', borderRadius: 4,
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  muted: { fontSize: 12, color: '#A89070' },
};
