import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  mood: {
    type: String,
    enum: ['happy', 'calm', 'neutral', 'sad', 'anxious', 'stressed'],
    required: true,
  },
  reflection: {
    type: String,
    default: null,
  },
  suggestions: {
    type: [String],
    default: [],
  },
  color_hint: {
    type: String,
    default: null,
  },
  is_reframed: {
    type: Boolean,
    default: false,
  },
  unlock_at: {
    type: Date,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

journalEntrySchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

// Index for efficient queries
journalEntrySchema.index({ user_id: 1, created_at: -1 });
journalEntrySchema.index({ user_id: 1, unlock_at: 1 });

export default mongoose.model('JournalEntry', journalEntrySchema);

