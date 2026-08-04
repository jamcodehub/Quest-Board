import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import QuestLog from './models/QuestLog.js';
import ShopItem from './models/ShopItem.js';
import verifyAdmin from './middleware/auth.js';

const PORT = process.env.PORT || 10000;
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://quest-boards.netlify.app',
  credentials: true,
}));
app.use(express.json());

// ─── XP HELPER ────────────────────────────────────────────────────────────────
// Returns the total XP required to reach a given level
function xpForLevel(level) {
  return Math.floor(100 * Math.pow(level, 1.5));
}

// Recalculates level from total XP
function calcLevel(totalXp) {
  let level = 1;
  while (totalXp >= xpForLevel(level + 1)) {
    level++;
    if (level >= 99) break;
  }
  return level;
}

// ─── STUDENT ROUTES ───────────────────────────────────────────────────────────

// GET /api/quests/:code — full student profile
app.get('/api/quests/:code', async (req, res) => {
  try {
    const log = await QuestLog.findOne({ questCode: req.params.code });
    if (!log) return res.status(404).json({ message: 'Invalid Quest Code' });

    res.json({
      questCode: log.questCode,
      quests: log.quests,
      xp: log.xp,
      gold: log.gold,
      level: log.level,
      inventory: log.inventory,
      equipped: log.equipped,
      powerups: log.powerups,
      xpForNextLevel: xpForLevel(log.level + 1),
      xpForCurrentLevel: xpForLevel(log.level),
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/quests/:code/complete/:questId — complete a quest, award XP + gold
app.post('/api/quests/:code/complete/:questId', async (req, res) => {
  try {
    const log = await QuestLog.findOne({ questCode: req.params.code });
    if (!log) return res.status(404).json({ message: 'Invalid Quest Code' });

    const quest = log.quests.id(req.params.questId);
    if (!quest) return res.status(404).json({ message: 'Quest not found' });
    if (quest.status === 'completed') {
      return res.status(400).json({ message: 'Quest already completed' });
    }

    // Mark complete
    quest.status = 'completed';
    quest.completedAt = new Date();

    // Award XP and gold
    const xpGained = quest.xpReward;
    const goldGained = quest.goldReward;
    log.xp += xpGained;
    log.gold += goldGained;

    // Recalculate level
    const newLevel = calcLevel(log.xp);
    const leveledUp = newLevel > log.level;
    log.level = newLevel;

    await log.save();

    res.json({
      message: 'Quest completed!',
      xpGained,
      goldGained,
      totalXp: log.xp,
      totalGold: log.gold,
      level: log.level,
      leveledUp,
      xpForNextLevel: xpForLevel(log.level + 1),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/quests/:code/uncomplete/:questId — undo a completed quest
app.post('/api/quests/:code/uncomplete/:questId', async (req, res) => {
  try {
    const log = await QuestLog.findOne({ questCode: req.params.code });
    if (!log) return res.status(404).json({ message: 'Invalid Quest Code' });

    const quest = log.quests.id(req.params.questId);
    if (!quest) return res.status(404).json({ message: 'Quest not found' });
    if (quest.status === 'pending') {
      return res.status(400).json({ message: 'Quest is not completed' });
    }

    // Deduct XP and gold
    log.xp = Math.max(0, log.xp - quest.xpReward);
    log.gold = Math.max(0, log.gold - quest.goldReward);
    log.level = calcLevel(log.xp);

    quest.status = 'pending';
    quest.completedAt = null;

    await log.save();

    res.json({
      message: 'Quest uncompleted.',
      totalXp: log.xp,
      totalGold: log.gold,
      level: log.level,
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/shop — all available shop items
app.get('/api/shop', async (req, res) => {
  try {
    const items = await ShopItem.find({ isAvailable: true }).sort({ category: 1, cost: 1 });
    res.json(items);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/quests/:code/purchase — buy an item
app.post('/api/quests/:code/purchase', async (req, res) => {
  try {
    const { itemId } = req.body;
    const log = await QuestLog.findOne({ questCode: req.params.code });
    if (!log) return res.status(404).json({ message: 'Invalid Quest Code' });

    const item = await ShopItem.findOne({ id: itemId, isAvailable: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (log.inventory.includes(itemId)) {
      return res.status(400).json({ message: 'You already own this item' });
    }
    if (log.level < item.levelRequired) {
      return res.status(400).json({ message: `Requires level ${item.levelRequired}` });
    }
    if (log.gold < item.cost) {
      return res.status(400).json({ message: 'Not enough gold' });
    }

    log.gold -= item.cost;
    log.inventory.push(itemId);

    // If powerup, add token
    if (item.category === 'powerup' && item.powerupType) {
      log.powerups[item.powerupType] = (log.powerups[item.powerupType] || 0) + 1;
    }

    await log.save();

    res.json({
      message: `Purchased ${item.name}!`,
      gold: log.gold,
      inventory: log.inventory,
      powerups: log.powerups,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/quests/:code/equip — equip an owned item
app.post('/api/quests/:code/equip', async (req, res) => {
  try {
    const { itemId } = req.body;
    const log = await QuestLog.findOne({ questCode: req.params.code });
    if (!log) return res.status(404).json({ message: 'Invalid Quest Code' });

    if (!log.inventory.includes(itemId)) {
      return res.status(400).json({ message: 'You do not own this item' });
    }

    const item = await ShopItem.findOne({ id: itemId });
    if (!item || item.category === 'powerup') {
      return res.status(400).json({ message: 'Item cannot be equipped' });
    }

    // Toggle: if already equipped, unequip
    if (log.equipped[item.category] === itemId) {
      log.equipped[item.category] = null;
    } else {
      log.equipped[item.category] = itemId;
    }

    log.markModified('equipped');
    await log.save();

    res.json({ message: 'Equipped!', equipped: log.equipped });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

const generateQuestCode = () => {
  const adjectives = ['crimson', 'shadow', 'neon', 'iron', 'ghost', 'silver', 'arcane', 'frozen'];
  const nouns = ['dragon', 'wolf', 'blade', 'spark', 'shield', 'grimoire', 'rune', 'ember'];
  const randomNum = Math.floor(Math.random() * 100);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  return `${pick(adjectives)}-${pick(nouns)}-${randomNum}`;
};

// POST /api/admin/quests — create a quest board
app.post('/api/admin/quests', verifyAdmin, async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ message: 'Please provide an array of tasks.' });
    }

    // Each task can be a string OR { title, xpReward, goldReward }
    const formattedQuests = tasks.map(t => ({
      title:      typeof t === 'string' ? t : t.title,
      xpReward:   typeof t === 'object' && t.xpReward  != null ? t.xpReward  : 50,
      goldReward: typeof t === 'object' && t.goldReward != null ? t.goldReward : 20,
      status: 'pending',
    }));

    let code = generateQuestCode();
    let isUnique = false;
    while (!isUnique) {
      const existing = await QuestLog.findOne({ questCode: code });
      if (existing) { code = generateQuestCode(); } else { isUnique = true; }
    }

    const newLog = new QuestLog({ questCode: code, quests: formattedQuests });
    await newLog.save();

    res.status(201).json({
      message: 'Quest Board successfully created!',
      questCode: code,
      totalTasks: formattedQuests.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating quests' });
  }
});

// GET /api/admin/shop — list all shop items (including unavailable)
app.get('/api/admin/shop', verifyAdmin, async (req, res) => {
  try {
    const items = await ShopItem.find().sort({ category: 1, cost: 1 });
    res.json(items);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/shop/:id — toggle availability or update item
app.patch('/api/admin/shop/:id', verifyAdmin, async (req, res) => {
  try {
    const item = await ShopItem.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── START ────────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
