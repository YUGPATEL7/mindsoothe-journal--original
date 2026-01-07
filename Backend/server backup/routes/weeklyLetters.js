import express from 'express';
import WeeklyLetter from '../models/WeeklyLetter.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all weekly letters
router.get('/', async (req, res) => {
  try {
    const letters = await WeeklyLetter.find({ user_id: req.user._id })
      .sort({ week_start: -1 })
      .lean();

    const formattedLetters = letters.map(letter => ({
      id: letter._id.toString(),
      user_id: letter.user_id.toString(),
      content: letter.content,
      week_start: letter.week_start.toISOString().split('T')[0],
      week_end: letter.week_end.toISOString().split('T')[0],
      created_at: letter.created_at.toISOString(),
    }));

    res.json(formattedLetters);
  } catch (error) {
    console.error('Get weekly letters error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly letters' });
  }
});

// Get letter for specific week
router.get('/week', async (req, res) => {
  try {
    const { weekStart, weekEnd } = req.query;

    if (!weekStart || !weekEnd) {
      return res.status(400).json({ error: 'weekStart and weekEnd are required' });
    }

    const letter = await WeeklyLetter.findOne({
      user_id: req.user._id,
      week_start: new Date(weekStart),
      week_end: new Date(weekEnd),
    }).lean();

    if (!letter) {
      return res.status(404).json({ error: 'Letter not found' });
    }

    res.json({
      id: letter._id.toString(),
      user_id: letter.user_id.toString(),
      content: letter.content,
      week_start: letter.week_start.toISOString().split('T')[0],
      week_end: letter.week_end.toISOString().split('T')[0],
      created_at: letter.created_at.toISOString(),
    });
  } catch (error) {
    console.error('Get weekly letter error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly letter' });
  }
});

export default router;

