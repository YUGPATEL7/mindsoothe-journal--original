# MindSoothe Journal - Backend Server

Express.js backend with MongoDB for the MindSoothe Journal application.

## Prerequisites

- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- OpenAI API key

## Installation

1. Install dependencies:
```bash
cd server
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/mindsoothe
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3001
OPENAI_API_KEY=sk-your-openai-api-key
FRONTEND_URL=http://localhost:5173
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in `.env`).

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Sign up new user
- `POST /api/auth/signin` - Sign in existing user
- `GET /api/auth/me` - Get current user

### Journal Entries
- `GET /api/journal` - Get all entries (paginated)
- `GET /api/journal/:id` - Get single entry
- `POST /api/journal` - Create new entry
- `PUT /api/journal/:id` - Update entry
- `DELETE /api/journal/:id` - Delete entry
- `GET /api/journal/unlocked/all` - Get unlocked time capsules
- `GET /api/journal/stats/mood` - Get mood statistics
- `GET /api/journal/stats/weekly` - Get weekly summary

### AI Features
- `POST /api/ai/analyze-entry` - Analyze journal entry with AI
- `POST /api/ai/generate-weekly-letter` - Generate weekly letter

### Weekly Letters
- `GET /api/weekly-letters` - Get all weekly letters
- `GET /api/weekly-letters/week` - Get letter for specific week

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## Database Models

### User
- email (unique)
- password (hashed)
- full_name
- created_at, updated_at

### Profile
- user_id (reference to User)
- full_name
- created_at, updated_at

### JournalEntry
- user_id (reference to User)
- content
- mood (enum: happy, calm, neutral, sad, anxious, stressed)
- reflection
- suggestions (array)
- color_hint
- is_reframed
- unlock_at (for time capsules)
- created_at, updated_at

### WeeklyLetter
- user_id (reference to User)
- content
- week_start, week_end
- created_at

### UserSettings
- user_id (reference to User)
- privacy_mode
- kind_friend_mode
- theme (light/dark)
- notifications_enabled
- updated_at

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are valid for 7 days.

## Health Check

- `GET /health` - Check server status

## MongoDB Connection

The server connects to MongoDB using the connection string in `MONGODB_URI`.

For local MongoDB:
```
MONGODB_URI=mongodb://localhost:27017/mindsoothe
```

For MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mindsoothe
```

