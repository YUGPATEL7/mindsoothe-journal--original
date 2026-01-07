import mongoose from 'mongoose';
import dotenv from 'dotenv';
import JournalEntry from './models/JournalEntry.js';
import User from './models/User.js';

dotenv.config();

async function testDirectSave() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
    console.log('   Database:', mongoose.connection.db.databaseName);

    // Find or create a test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('Creating test user...');
      testUser = new User({
        email: 'test@example.com',
        password: 'testpassword123',
        full_name: 'Test User'
      });
      await testUser.save();
      console.log('✅ Test user created:', testUser._id);
    } else {
      console.log('✅ Using existing test user:', testUser._id);
    }

    // Test saving a journal entry directly
    console.log('\n📝 Testing direct journal entry save...');
    const testEntry = new JournalEntry({
      user_id: testUser._id,
      content: 'This is a direct test entry from test script',
      mood: 'calm',
      reflection: 'Test reflection',
      suggestions: ['Test suggestion 1', 'Test suggestion 2', 'Test suggestion 3'],
      color_hint: 'soft blue',
      is_reframed: false,
    });

    console.log('Entry before save:', {
      user_id: testEntry.user_id,
      content: testEntry.content,
      mood: testEntry.mood
    });

    const savedEntry = await testEntry.save();
    console.log('✅ Entry saved!');
    console.log('   Saved Entry ID:', savedEntry._id);
    console.log('   Saved User ID:', savedEntry.user_id);

    // Verify by querying
    console.log('\n🔍 Verifying entry was saved...');
    const foundEntry = await JournalEntry.findById(savedEntry._id);
    if (foundEntry) {
      console.log('✅ Entry found in database!');
      console.log('   ID:', foundEntry._id);
      console.log('   Content:', foundEntry.content);
      console.log('   Mood:', foundEntry.mood);
    } else {
      console.log('❌ Entry NOT found in database!');
    }

    // Count all entries
    const totalEntries = await JournalEntry.countDocuments();
    console.log(`\n📊 Total entries in database: ${totalEntries}`);

    // Count entries for this user
    const userEntries = await JournalEntry.countDocuments({ user_id: testUser._id });
    console.log(`📊 Entries for test user: ${userEntries}`);

    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📚 Collections in database:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    // Show sample entries
    const sampleEntries = await JournalEntry.find({ user_id: testUser._id }).limit(3);
    console.log(`\n📝 Sample entries (showing ${sampleEntries.length}):`);
    sampleEntries.forEach((entry, idx) => {
      console.log(`   ${idx + 1}. ID: ${entry._id}, Content: ${entry.content?.substring(0, 40)}...`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    process.exit(1);
  }
}

testDirectSave();

