import express from 'express';
import JournalEntry from '../models/JournalEntry.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all entries (paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = page * pageSize;

    const entries = await JournalEntry.find({ user_id: req.user._id })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    // Convert MongoDB _id to id and format dates
    const formattedEntries = entries.map(entry => ({
      id: entry._id.toString(),
      user_id: entry.user_id.toString(),
      content: entry.content,
      mood: entry.mood,
      reflection: entry.reflection,
      suggestions: entry.suggestions,
      color_hint: entry.color_hint,
      is_reframed: entry.is_reframed,
      unlock_at: entry.unlock_at ? entry.unlock_at.toISOString() : null,
      created_at: entry.created_at.toISOString(),
      updated_at: entry.updated_at.toISOString(),
    }));

    res.json(formattedEntries);
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// Get unlocked entries (time capsules) - MUST be before /:id route
router.get('/unlocked/all', async (req, res) => {
  try {
    const now = new Date();
    const entries = await JournalEntry.find({
      user_id: req.user._id,
      unlock_at: { $lte: now, $ne: null },
    })
      .sort({ unlock_at: 1 })
      .lean();

    const formattedEntries = entries.map(entry => ({
      id: entry._id.toString(),
      user_id: entry.user_id.toString(),
      content: entry.content,
      mood: entry.mood,
      reflection: entry.reflection,
      suggestions: entry.suggestions,
      color_hint: entry.color_hint,
      is_reframed: entry.is_reframed,
      unlock_at: entry.unlock_at ? entry.unlock_at.toISOString() : null, // Defensive null check
      created_at: entry.created_at.toISOString(),
      updated_at: entry.updated_at.toISOString(),
    }));

    res.json(formattedEntries);
  } catch (error) {
    console.error('Get unlocked entries error:', error);
    res.status(500).json({ error: 'Failed to fetch unlocked entries' });
  }
});

// Get mood stats - MUST be before /:id route
router.get('/stats/mood', async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(0);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const entries = await JournalEntry.find({
      user_id: req.user._id,
      created_at: { $gte: startDate, $lte: endDate },
    }).select('mood').lean();

    const stats = {
      happy: 0,
      calm: 0,
      neutral: 0,
      sad: 0,
      anxious: 0,
      stressed: 0,
    };

    entries.forEach(entry => {
      if (stats.hasOwnProperty(entry.mood)) {
        stats[entry.mood]++;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error('Get mood stats error:', error);
    res.status(500).json({ error: 'Failed to fetch mood stats' });
  }
});

// Get weekly summary - MUST be before /:id route
router.get('/stats/weekly', async (req, res) => {
  try {
    const weekEnd = new Date();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const entries = await JournalEntry.find({
      user_id: req.user._id,
      created_at: { $gte: weekStart, $lte: weekEnd },
    }).select('mood').lean();

    const moodDistribution = {
      happy: 0,
      calm: 0,
      neutral: 0,
      sad: 0,
      anxious: 0,
      stressed: 0,
    };

    entries.forEach(entry => {
      if (moodDistribution.hasOwnProperty(entry.mood)) {
        moodDistribution[entry.mood]++;
      }
    });

    // Calculate dominant mood with proper error handling and tie resolution
    const moodEntries = Object.entries(moodDistribution);
    if (moodEntries.length === 0) {
      return res.status(400).json({ error: 'No mood data available' });
    }

    // Sort by count (descending) and handle ties by returning the first one
    const sortedMoods = moodEntries.sort((a, b) => b[1] - a[1]);
    const dominantMood = sortedMoods[0][0]; // Get the mood name from [mood, count]

    res.json({
      totalEntries: entries.length,
      moodDistribution,
      dominantMood,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
    });
  } catch (error) {
    console.error('Get weekly summary error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly summary' });
  }
});

// Get single entry - MUST be after all specific routes
router.get('/:id', async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    }).lean();

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({
      id: entry._id.toString(),
      user_id: entry.user_id.toString(),
      content: entry.content,
      mood: entry.mood,
      reflection: entry.reflection,
      suggestions: entry.suggestions,
      color_hint: entry.color_hint,
      is_reframed: entry.is_reframed,
      unlock_at: entry.unlock_at ? entry.unlock_at.toISOString() : null,
      created_at: entry.created_at.toISOString(),
      updated_at: entry.updated_at.toISOString(),
    });
  } catch (error) {
    console.error('Get entry error:', error);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

// Create entry
router.post('/', async (req, res) => {
  try {
    const {
      content,
      mood,
      reflection,
      suggestions,
      color_hint,
      is_reframed,
      unlock_at,
    } = req.body;

    console.log('Create entry request:', { 
      user_id: req.user?._id, 
      hasContent: !!content, 
      mood,
      bodyKeys: Object.keys(req.body) 
    });

    if (!content || !mood) {
      return res.status(400).json({ error: 'Content and mood are required' });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const entry = new JournalEntry({
      user_id: req.user._id,
      content,
      mood,
      reflection: reflection || null,
      suggestions: suggestions || [],
      color_hint: color_hint || null,
      is_reframed: is_reframed || false,
      unlock_at: unlock_at ? new Date(unlock_at) : null,
    });

    console.log('Saving entry to database...');
    console.log('Entry data before save:', {
      user_id: entry.user_id,
      content: entry.content?.substring(0, 50) + '...',
      mood: entry.mood,
      hasReflection: !!entry.reflection,
      suggestionsCount: entry.suggestions?.length || 0
    });
    
    let savedEntry;
    try {
      savedEntry = await entry.save();
      console.log('✅ Entry saved successfully!');
      console.log('   Entry ID:', savedEntry._id);
      console.log('   User ID:', savedEntry.user_id);
      console.log('   Collection name:', savedEntry.constructor.modelName);
      
      // Verify it was actually saved
      const verifyEntry = await JournalEntry.findById(savedEntry._id);
      if (verifyEntry) {
        console.log('✅ Verified: Entry exists in database');
        console.log('   Verified content:', verifyEntry.content?.substring(0, 30) + '...');
      } else {
        console.log('❌ WARNING: Entry not found after save!');
      }
    } catch (saveError) {
      console.error('❌ Save error:', saveError);
      console.error('Error name:', saveError.name);
      console.error('Error message:', saveError.message);
      if (saveError.errors) {
        console.error('Validation errors:', saveError.errors);
      }
      throw saveError;
    }

    res.status(201).json({
      id: savedEntry._id.toString(),
      user_id: savedEntry.user_id.toString(),
      content: savedEntry.content,
      mood: savedEntry.mood,
      reflection: savedEntry.reflection,
      suggestions: savedEntry.suggestions,
      color_hint: savedEntry.color_hint,
      is_reframed: savedEntry.is_reframed,
      unlock_at: savedEntry.unlock_at ? savedEntry.unlock_at.toISOString() : null,
      created_at: savedEntry.created_at.toISOString(),
      updated_at: savedEntry.updated_at.toISOString(),
    });
  } catch (error) {
    console.error('❌ Create entry error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to create entry',
      details: error.message 
    });
  }
});

// Update entry
router.put('/:id', async (req, res) => {
  try {
    // Whitelist only allowed fields to prevent unauthorized field modification
    const allowedFields = [
      'content',
      'mood',
      'reflection',
      'suggestions',
      'color_hint',
      'is_reframed',
      'unlock_at'
    ];

    // Build update object with only whitelisted fields
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        updateData[field] = req.body[field];
      }
    });

    // Always update the updated_at timestamp
    updateData.updated_at = Date.now();

    const entry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({
      id: entry._id.toString(),
      user_id: entry.user_id.toString(),
      content: entry.content,
      mood: entry.mood,
      reflection: entry.reflection,
      suggestions: entry.suggestions,
      color_hint: entry.color_hint,
      is_reframed: entry.is_reframed,
      unlock_at: entry.unlock_at ? entry.unlock_at.toISOString() : null,
      created_at: entry.created_at.toISOString(),
      updated_at: entry.updated_at.toISOString(),
    });
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// Delete entry
router.delete('/:id', async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

export default router;

