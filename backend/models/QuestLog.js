import mongoose from 'mongoose';

const questSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  xpReward: { type: Number, default: 50 },
  goldReward: { type: Number, default: 20 },
  completedAt: { type: Date, default: null },
});

const questLogSchema = new mongoose.Schema({
  questCode: {
    type: String,
    required: true,
    unique: true,
  },
  quests: [questSchema],

  // Player progression
  xp: { type: Number, default: 0 },
  gold: { type: Number, default: 0 },
  level: { type: Number, default: 1 },

  // Owned item IDs
  inventory: [{ type: String }],

  // Equipped item IDs per slot
  equipped: {
    weapon:    { type: String, default: null },
    armor:     { type: String, default: null },
    companion: { type: String, default: null },
    title:     { type: String, default: null },
  },

  // Power-up tokens
  powerups: {
    hint:     { type: Number, default: 0 },
    extraDay: { type: Number, default: 0 },
    reroll:   { type: Number, default: 0 },
  },
}, { timestamps: true });

// XP thresholds per level (level N requires xpThresholds[N-1] total XP)
questLogSchema.statics.xpForLevel = function(level) {
  return Math.floor(100 * Math.pow(level, 1.5));
};

export default mongoose.model('QuestLog', questLogSchema);
