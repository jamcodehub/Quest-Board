import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import QuestLog from './models/QuestLog.js';
import verifyAdmin from './middleware/auth.js';

const PORT = process.env.PORT || 10000;
const app = express();

app.use(cors({
  origin: 'https://quest-boards.netlify.app',
  credentials: true
}));

app.use(express.json());

// API Route: Fetch quests by code
app.get('/api/quests/:code', async (req, res) => {
  try {
    const studentLog = await QuestLog.findOne({ questCode: req.params.code });
    if (!studentLog) {
      return res.status(404).json({ message: 'Invalid Quest Code' });
    }
    res.json(studentLog.quests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate codes like 'shadow-wolf-84'
const generateQuestCode = () => {
  const adjectives = ['crimson', 'shadow', 'neon', 'iron', 'ghost', 'silver'];
  const nouns = ['dragon', 'wolf', 'blade', 'spark', 'shield', 'grimoire'];
  const randomNum = Math.floor(Math.random() * 100);
  
  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  
  return `${pickRandom(adjectives)}-${pickRandom(nouns)}-${randomNum}`;
};

// POST Route: Protected by verifyAdmin
app.post('/api/admin/quests', verifyAdmin, async (req, res) => {
  try {
    const { tasks } = req.body; 

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ message: 'Please provide an array of tasks.' });
    }

    const formattedQuests = tasks.map(title => ({
      title: title,
      status: 'pending'
    }));

    let code = generateQuestCode();
    
    let isUnique = false;
    while (!isUnique) {
      const existing = await QuestLog.findOne({ questCode: code });
      if (existing) {
        code = generateQuestCode();
      } else {
        isUnique = true;
      }
    }

    const newStudentLog = new QuestLog({
      questCode: code,
      quests: formattedQuests
    });

    await newStudentLog.save();

    res.status(201).json({ 
      message: 'Quest Board successfully created!', 
      questCode: code,
      totalTasks: formattedQuests.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating quests' });
  }
});

// Connect to MongoDB first, then spin up the server on '0.0.0.0' for Render
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });