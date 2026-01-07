import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  privacy_mode: {
    type: Boolean,
    default: false,
  },
  kind_friend_mode: {
    type: Boolean,
    default: false,
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light',
  },
  notifications_enabled: {
    type: Boolean,
    default: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

userSettingsSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.model('UserSettings', userSettingsSchema);

