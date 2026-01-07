import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import UserSettings from '../models/UserSettings.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    console.log('📝 Signup request received:', { email, hasPassword: !!password, full_name });

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ error: 'User already exists' });
    }

    console.log('✅ Creating new user...');
    // Create user
    const user = new User({ email, password, full_name });
    await user.save();
    console.log('✅ User created:', user._id);

    // Create profile
    console.log('✅ Creating profile...');
    const profile = new Profile({ user_id: user._id, full_name });
    await profile.save();
    console.log('✅ Profile created:', profile._id);

    // Create default settings
    console.log('✅ Creating default settings...');
    const settings = new UserSettings({ user_id: user._id });
    await settings.save();
    console.log('✅ Settings created:', settings._id);

    // Generate token
    const token = generateToken(user._id);
    console.log('✅ Token generated');

    console.log('✅ Signup successful for:', email);
    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
      },
      token,
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to create user',
      details: error.message 
    });
  }
});

// Sign In
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Signin request received:', { email, hasPassword: !!password });

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ User found:', user._id);

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Password verified');

    // Generate token
    const token = generateToken(user._id);
    console.log('✅ Token generated');
    console.log('✅ Signin successful for:', email);

    res.json({
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
      },
      token,
    });
  } catch (error) {
    console.error('❌ Signin error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to sign in',
      details: error.message 
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
      },
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;

