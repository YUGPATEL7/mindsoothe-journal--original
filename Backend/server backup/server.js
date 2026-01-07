import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import journalRoutes from './routes/journal.js';
import aiRoutes from './routes/ai.js';
import weeklyLettersRoutes from './routes/weeklyLetters.js';
import settingsRoutes from './routes/settings.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:8080', // Primary frontend URL
  'http://127.0.0.1:8080',
  'http://localhost:5173', // Fallback for Vite default
  'http://127.0.0.1:5173',
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'MindSoothe Backend API',
    status: 'running',
    version: '1.0.0',
    database: 'MongoDB',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      journal: '/api/journal',
      ai: '/api/ai',
      weeklyLetters: '/api/weekly-letters',
      settings: '/api/settings'
    },
    documentation: 'See /api for available endpoints'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'MindSoothe Backend API is running',
    database: 'MongoDB',
    timestamp: new Date().toISOString()
  });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'MindSoothe API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      journal: '/api/journal',
      ai: '/api/ai',
      weeklyLetters: '/api/weekly-letters',
      settings: '/api/settings'
    }
  });
});

// Request logging middleware (skip favicon)
app.use((req, res, next) => {
  if (req.path !== '/favicon.ico') {
    console.log(`${req.method} ${req.path}`, {
      origin: req.headers.origin,
      hasAuth: !!req.headers.authorization
    });
  }
  next();
});

// Ignore favicon requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/weekly-letters', weeklyLettersRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    path: req.path,
    availableRoutes: [
      'GET /health',
      'POST /api/auth/signup',
      'POST /api/auth/signin',
      'GET /api/auth/me',
      'GET /api/journal',
      'POST /api/journal',
      'POST /api/ai/analyze-entry',
      'POST /api/ai/generate-weekly-letter'
    ]
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Database: MongoDB`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

