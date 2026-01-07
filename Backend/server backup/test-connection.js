import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_BASE = process.env.API_BASE || 'http://localhost:3001/api';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsoothe';

async function testMongoConnection() {
  try {
    console.log('🔌 Testing MongoDB connection...');
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    
    // Test collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`   Collections: ${collections.length}`);
    collections.forEach(col => console.log(`     - ${col.name}`));
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

async function testServerConnection() {
  try {
    console.log('\n🌐 Testing Express server connection...');
    const response = await fetch(`${API_BASE.replace('/api', '')}/health`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Server is running`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Database: ${data.database}`);
      return true;
    } else {
      console.error('❌ Server health check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    console.log('   Make sure the server is running on port 3001');
    return false;
  }
}

async function testAuthEndpoints() {
  try {
    console.log('\n🔐 Testing authentication endpoints...');
    
    // Test signup
    const signupResponse = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        password: 'testpassword123',
        full_name: 'Test User'
      })
    });
    
    if (signupResponse.ok) {
      const signupData = await signupResponse.json();
      console.log('✅ Signup endpoint working');
      console.log(`   User ID: ${signupData.user.id}`);
      
      // Test signin
      const signinResponse = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupData.user.email,
          password: 'testpassword123'
        })
      });
      
      if (signinResponse.ok) {
        const signinData = await signinResponse.json();
        console.log('✅ Signin endpoint working');
        console.log(`   Token received: ${signinData.token ? 'Yes' : 'No'}`);
        
        // Test protected endpoint
        const meResponse = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${signinData.token}`
          }
        });
        
        if (meResponse.ok) {
          console.log('✅ Protected endpoint working');
          return true;
        } else {
          console.error('❌ Protected endpoint failed');
          return false;
        }
      } else {
        console.error('❌ Signin endpoint failed');
        return false;
      }
    } else {
      console.error('❌ Signup endpoint failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Auth endpoints test failed:', error.message);
    return false;
  }
}

async function testJournalEndpoints() {
  try {
    console.log('\n📝 Testing journal endpoints...');
    
    // First, create a test user and get token
    const signupResponse = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `journal-test-${Date.now()}@example.com`,
        password: 'testpassword123',
        full_name: 'Journal Test User'
      })
    });
    
    const { user, token } = await signupResponse.json();
    
    // Test create entry
    const createResponse = await fetch(`${API_BASE}/journal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        content: 'Test journal entry',
        mood: 'calm',
        reflection: 'Test reflection',
        suggestions: ['Suggestion 1', 'Suggestion 2', 'Suggestion 3'],
        color_hint: 'soft blue',
        is_reframed: false
      })
    });
    
    if (createResponse.ok) {
      const entry = await createResponse.json();
      console.log('✅ Create entry endpoint working');
      console.log(`   Entry ID: ${entry.id}`);
      
      // Test get entries
      const getResponse = await fetch(`${API_BASE}/journal?page=0&pageSize=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (getResponse.ok) {
        const entries = await getResponse.json();
        console.log('✅ Get entries endpoint working');
        console.log(`   Entries found: ${entries.length}`);
        return true;
      } else {
        console.error('❌ Get entries endpoint failed');
        return false;
      }
    } else {
      console.error('❌ Create entry endpoint failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Journal endpoints test failed:', error.message);
    return false;
  }
}

async function generateReport() {
  console.log('='.repeat(60));
  console.log('MindSoothe Backend Connection Test Report');
  console.log('='.repeat(60));
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`API Base: ${API_BASE}`);
  console.log(`MongoDB URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
  console.log('='.repeat(60));
  
  const results = {
    mongodb: await testMongoConnection(),
    server: await testServerConnection(),
    auth: await testAuthEndpoints(),
    journal: await testJournalEndpoints()
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('Test Results Summary');
  console.log('='.repeat(60));
  console.log(`MongoDB Connection: ${results.mongodb ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Server Connection: ${results.server ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Auth Endpoints: ${results.auth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Journal Endpoints: ${results.journal ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(60));
  
  const allPassed = Object.values(results).every(r => r);
  console.log(`\nOverall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('='.repeat(60));
  
  if (allPassed) {
    console.log('\n🎉 Backend is properly connected and working!');
    console.log('✅ Frontend can now connect to the backend API.');
  } else {
    console.log('\n⚠️  Please fix the failing tests before using the backend.');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Run tests
generateReport();

