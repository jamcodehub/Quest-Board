import mongoose from 'mongoose';

const shopItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['weapon', 'armor', 'companion', 'title', 'powerup'],
    required: true,
  },
  cost: { type: Number, required: true },
  emoji: { type: String, default: '⚔️' },
  levelRequired: { type: Number, default: 1 },
  isAvailable: { type: Boolean, default: true },
  // For powerups: which token type to award
  powerupType: { type: String, default: null },
});

export default mongoose.model('ShopItem', shopItemSchema);
