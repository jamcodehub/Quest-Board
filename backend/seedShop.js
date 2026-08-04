import mongoose from 'mongoose';
import ShopItem from './models/ShopItem.js';

const items = [
  // ── WEAPONS ──────────────────────────────────────────────────────────────
  { id: 'dagger',        name: 'Iron Dagger',       description: 'A simple but reliable blade.',         category: 'weapon',   cost: 30,  emoji: '🗡️',  levelRequired: 1 },
  { id: 'staff',         name: 'Apprentice Staff',   description: 'Hums with residual magic.',            category: 'weapon',   cost: 60,  emoji: '🪄',  levelRequired: 2 },
  { id: 'sword',         name: 'Silver Sword',       description: 'Balanced and gleaming.',               category: 'weapon',   cost: 100, emoji: '⚔️',  levelRequired: 3 },
  { id: 'grimoire',      name: 'Dark Grimoire',      description: 'Pages flutter on their own.',          category: 'weapon',   cost: 180, emoji: '📖',  levelRequired: 5 },

  // ── ARMOR ────────────────────────────────────────────────────────────────
  { id: 'hood',          name: 'Leather Hood',       description: 'Worn but dependable.',                 category: 'armor',    cost: 40,  emoji: '🎩',  levelRequired: 1 },
  { id: 'cloak',         name: 'Shadow Cloak',       description: 'Seems to absorb light.',               category: 'armor',    cost: 80,  emoji: '🧥',  levelRequired: 2 },
  { id: 'shield',        name: 'Kite Shield',        description: 'Heavy, sturdy, reassuring.',           category: 'armor',    cost: 120, emoji: '🛡️',  levelRequired: 3 },
  { id: 'robe',          name: 'Arcane Robe',        description: 'Woven with protective sigils.',        category: 'armor',    cost: 200, emoji: '👘',  levelRequired: 5 },

  // ── COMPANIONS ───────────────────────────────────────────────────────────
  { id: 'cat',           name: 'Tabby Familiar',     description: 'Watches everything. Judges silently.', category: 'companion',cost: 50,  emoji: '🐱',  levelRequired: 1 },
  { id: 'ghost',         name: 'Class Ghost',        description: 'The original quest giver.',            category: 'companion',cost: 80,  emoji: '👻',  levelRequired: 2 },
  { id: 'dragon',        name: 'Baby Dragon',        description: 'Small. Still terrifying.',             category: 'companion',cost: 150, emoji: '🐉',  levelRequired: 4 },
  { id: 'owl',           name: 'Wise Owl',           description: 'Knows things it shouldn\'t.',          category: 'companion',cost: 100, emoji: '🦉',  levelRequired: 3 },
  { id: 'phoenix',       name: 'Phoenix Hatchling',  description: 'Sets small things on fire by accident.',category:'companion',cost: 220, emoji: '🐦‍🔥', levelRequired: 6 },

  // ── TITLES ───────────────────────────────────────────────────────────────
  { id: 'title_scholar', name: 'Arcane Scholar',     description: 'You have read the docs.',              category: 'title',    cost: 60,  emoji: '📜',  levelRequired: 2 },
  { id: 'title_rogue',   name: 'Shadow Rogue',       description: 'Answers questions before they\'re asked.', category: 'title', cost: 60, emoji: '🌑',  levelRequired: 2 },
  { id: 'title_knight',  name: 'Debug Knight',       description: 'Finds bugs. Slays bugs.',              category: 'title',    cost: 80,  emoji: '⚔️',  levelRequired: 3 },
  { id: 'title_sage',    name: 'Code Sage',          description: 'Speaks in functions.',                 category: 'title',    cost: 120, emoji: '🔮',  levelRequired: 5 },

  // ── POWER-UPS ────────────────────────────────────────────────────────────
  { id: 'hint_token',    name: 'Hint Token',         description: 'Ask your instructor for one hint.',    category: 'powerup',  cost: 40,  emoji: '💡',  levelRequired: 1, powerupType: 'hint' },
  { id: 'extra_day',     name: 'Extra Day',          description: 'One deadline extension (instructor approval required).', category: 'powerup', cost: 100, emoji: '📅', levelRequired: 1, powerupType: 'extraDay' },
  { id: 'reroll',        name: 'Re-roll',            description: 'Redo one quiz or task attempt.',       category: 'powerup',  cost: 80,  emoji: '🎲',  levelRequired: 1, powerupType: 'reroll' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await ShopItem.deleteMany({});
  await ShopItem.insertMany(items);
  console.log(`✅ Seeded ${items.length} shop items`);
  mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
