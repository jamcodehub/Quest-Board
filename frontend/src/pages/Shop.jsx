import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:10000';
const CATEGORIES = ['all', 'weapon', 'armor', 'companion', 'title', 'powerup'];

export default function Shop() {
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(null);
  const [toast, setToast] = useState(null);

  const questCode = localStorage.getItem('activeQuestCode');

  useEffect(() => {
    if (!questCode) { setLoading(false); return; }
    Promise.all([
      fetch(`${API}/api/quests/${questCode}`).then(r => r.json()),
      fetch(`${API}/api/shop`).then(r => r.json()),
    ]).then(([p, s]) => {
      setProfile(p);
      setItems(Array.isArray(s) ? s : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const showToast = (msg, color = '#4A7C59') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  const handlePurchase = async (item) => {
    if (pending || !profile) return;
    setPending(item.id);

    try {
      const res = await fetch(`${API}/api/quests/${questCode}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Purchase failed', '#B85C38');
      } else {
        setProfile(prev => ({
          ...prev,
          gold: data.gold,
          inventory: data.inventory,
          powerups: data.powerups,
        }));
        showToast(`Purchased ${item.name}!`);
      }
    } catch {
      showToast('Connection error', '#B85C38');
    }
    setPending(null);
  };

  const handleEquip = async (item) => {
    if (pending || !profile) return;
    setPending(item.id);

    try {
      const res = await fetch(`${API}/api/quests/${questCode}/equip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Equip failed', '#B85C38');
      } else {
        setProfile(prev => ({ ...prev, equipped: data.equipped }));
        const isNowEquipped = data.equipped[item.category] === item.id;
        showToast(isNowEquipped ? `Equipped ${item.name}!` : `Unequipped ${item.name}`);
      }
    } catch {
      showToast('Connection error', '#B85C38');
    }
    setPending(null);
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);

  if (loading) return <div style={s.page}><div style={s.muted}>Loading shop...</div></div>;
  if (!questCode) return (
    <div style={s.page}>
      <div style={s.pageTitle}>Shop</div>
      <div style={s.muted}>Load a quest code first to access the shop.</div>
    </div>
  );

  return (
    <div style={s.page}>
      {toast && <div style={{ ...s.toast, background: toast.color }}>{toast.msg}</div>}

      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.pageTitle}>Shop</div>
          <div style={s.pageSubtitle}>Spend your gold on gear, companions, and power-ups.</div>
        </div>
        <div style={s.goldDisplay}>
          <span style={s.goldEmoji}>🪙</span>
          <span style={s.goldAmount}>{profile?.gold ?? 0}g</span>
        </div>
      </div>

      {/* Category tabs */}
      <div style={s.tabs}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{ ...s.tab, ...(filter === cat ? s.tabActive : {}) }}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div style={s.grid}>
        {filtered.map(item => {
          const owned = profile?.inventory?.includes(item.id);
          const equipped = profile?.equipped?.[item.category] === item.id;
          const canAfford = (profile?.gold ?? 0) >= item.cost;
          const levelOk = (profile?.level ?? 1) >= item.levelRequired;
          const isPowerup = item.category === 'powerup';
          const isLoading = pending === item.id;

          return (
            <div key={item.id} style={{ ...s.card, ...(owned ? s.cardOwned : {}) }}>
              <div style={s.cardEmoji}>{item.emoji}</div>
              <div style={s.cardName}>{item.name}</div>
              <div style={s.cardDesc}>{item.description}</div>

              <div style={s.cardMeta}>
                <span style={s.costBadge}>🪙 {item.cost}g</span>
                {item.levelRequired > 1 && (
                  <span style={{ ...s.levelBadge, ...(levelOk ? {} : s.levelBadgeLocked) }}>
                    Lv.{item.levelRequired}
                  </span>
                )}
              </div>

              {/* Action button */}
              {owned && !isPowerup ? (
                <button
                  onClick={() => handleEquip(item)}
                  disabled={!!pending}
                  style={{ ...s.btn, ...(equipped ? s.btnEquipped : s.btnOwned) }}
                >
                  {isLoading ? '...' : equipped ? 'Unequip' : 'Equip'}
                </button>
              ) : owned && isPowerup ? (
                <div style={s.ownedTag}>In Inventory</div>
              ) : (
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={!!pending || !canAfford || !levelOk}
                  style={{
                    ...s.btn, ...s.btnBuy,
                    ...(!canAfford || !levelOk ? s.btnDisabled : {}),
                  }}
                >
                  {isLoading ? '...' : !levelOk ? `Level ${item.levelRequired} required` : !canAfford ? 'Not enough gold' : 'Purchase'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  page: { padding: '40px 48px', maxWidth: 960, position: 'relative' },
  pageTitle: { fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: '#2C2416', marginBottom: 4 },
  pageSubtitle: { fontSize: 12, color: '#8B7355' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  goldDisplay: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', background: '#FEF3C7',
    border: '1px solid #F6D860', borderRadius: 8,
  },
  goldEmoji: { fontSize: 18 },
  goldAmount: { fontSize: 18, fontWeight: 700, color: '#92610A', fontVariantNumeric: 'tabular-nums' },
  tabs: { display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' },
  tab: {
    padding: '6px 14px', borderRadius: 6, border: '1px solid #E8E3D8',
    background: '#FAFAF7', color: '#8B7355', fontSize: 12, fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
  },
  tabActive: { background: '#7D6340', color: '#FFFDF9', borderColor: '#7D6340' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 12,
  },
  card: {
    background: '#FFFFFF', border: '1px solid #E8E3D8', borderRadius: 8,
    padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 6,
    transition: 'border-color 0.12s',
  },
  cardOwned: { background: '#F5F2EA', borderColor: '#D0C9BC' },
  cardEmoji: { fontSize: 28, marginBottom: 2 },
  cardName: { fontSize: 13, fontWeight: 700, color: '#2C2416' },
  cardDesc: { fontSize: 11, color: '#8B7355', lineHeight: 1.5, flex: 1 },
  cardMeta: { display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 },
  costBadge: {
    fontSize: 11, fontWeight: 600, padding: '2px 8px',
    background: '#FEF3C7', color: '#92610A', borderRadius: 4,
  },
  levelBadge: {
    fontSize: 11, fontWeight: 600, padding: '2px 8px',
    background: '#EDE7D9', color: '#7D6340', borderRadius: 4,
  },
  levelBadgeLocked: { background: '#F5F5F5', color: '#C8C2B6' },
  btn: {
    marginTop: 4, padding: '7px 0', borderRadius: 6, border: 'none',
    fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    width: '100%', transition: 'background 0.12s',
  },
  btnBuy: { background: '#7D6340', color: '#FFFDF9' },
  btnOwned: { background: '#EDE7D9', color: '#7D6340' },
  btnEquipped: { background: '#D0C9BC', color: '#5C4A2A' },
  btnDisabled: { background: '#F0EBE0', color: '#C8C2B6', cursor: 'not-allowed' },
  ownedTag: {
    marginTop: 4, padding: '6px 0', textAlign: 'center',
    fontSize: 11, color: '#A89070', fontWeight: 500,
  },
  toast: {
    position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
    color: '#fff', fontSize: 13, fontWeight: 600,
    padding: '10px 22px', borderRadius: 8, zIndex: 999,
    pointerEvents: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
    whiteSpace: 'nowrap',
  },
  muted: { fontSize: 12, color: '#A89070' },
};
