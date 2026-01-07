import mongoose from 'mongoose';

const weeklyLetterSchema = new mongoose.Schema({
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
  week_start: {
    type: Date,
    required: true,
  },
  week_end: {
    type: Date,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
weeklyLetterSchema.index({ user_id: 1, week_start: -1 });

export default mongoose.model('WeeklyLetter', weeklyLetterSchema);

