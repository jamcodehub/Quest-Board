import mongoose from 'mongoose';

const questLogSchema = new mongoose.Schema({
  questCode: { 
    type: String, 
    required: true, 
    unique: true // e.g., 'crimson-dragon-42'
  },
  quests: [{
    title: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
  }]
});

export default mongoose.model('QuestLog', questLogSchema);