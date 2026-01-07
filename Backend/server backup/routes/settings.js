import express from 'express';
import UserSettings from '../models/UserSettings.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user settings
router.get('/', async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ user_id: req.user._id }).lean();

    if (!settings) {
      // Create default settings if they don't exist
      settings = new UserSettings({ user_id: req.user._id });
      await settings.save();
      settings = settings.toObject();
    }

    res.json({
      user_id: settings.user_id.toString(),
      privacy_mode: settings.privacy_mode,
      kind_friend_mode: settings.kind_friend_mode,
      theme: settings.theme,
      notifications_enabled: settings.notifications_enabled,
      updated_at: settings.updated_at.toISOString(),
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update user settings
router.put('/', async (req, res) => {
  try {
    const updates = req.body;
    
    let settings = await UserSettings.findOneAndUpdate(
      { user_id: req.user._id },
      { ...updates, updated_at: Date.now() },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    res.json({
      user_id: settings.user_id.toString(),
      privacy_mode: settings.privacy_mode,
      kind_friend_mode: settings.kind_friend_mode,
      theme: settings.theme,
      notifications_enabled: settings.notifications_enabled,
      updated_at: settings.updated_at.toISOString(),
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;

