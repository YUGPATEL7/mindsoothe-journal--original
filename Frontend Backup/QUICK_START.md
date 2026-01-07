# Quick Start Guide - MindSoothe Journal

## Prerequisites

- Node.js 18+ installed
- MongoDB installed and running (or MongoDB Atlas account)
- OpenAI API key

## Step 1: Setup Backend

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` with your settings:
```env
MONGODB_URI=mongodb://localhost:27017/mindsoothe
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=3001
OPENAI_API_KEY=sk-your-openai-api-key
FRONTEND_URL=http://localhost:5173
```

5. Start MongoDB (if using local):
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# On Windows
# Start MongoDB service from Services panel
```

6. Start the backend server:
```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running on http://localhost:3001
```

## Step 2: Setup Frontend

1. In the root directory, create `.env` file:
```env
VITE_API_URL=http://localhost:3001/api
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Start the frontend:
```bash
npm run dev
```

## Step 3: Verify Connection

1. Test backend connection:
```bash
cd server
node test-connection.js
```

You should see all tests passing:
```
✅ MongoDB Connected
✅ Server is running
✅ Signup endpoint working
✅ Signin endpoint working
✅ Protected endpoint working
✅ Create entry endpoint working
✅ Get entries endpoint working

🎉 Backend is properly connected and working!
```

2. Open the frontend in your browser:
```
http://localhost:5173
```

3. Try signing up a new user to verify everything works!

## Troubleshooting

### MongoDB Connection Failed
- Make sure MongoDB is running
- Check your `MONGODB_URI` in `.env`
- For MongoDB Atlas, ensure your IP is whitelisted

### Server Won't Start
- Check if port 3001 is already in use
- Verify all environment variables are set
- Check MongoDB connection

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` is set correctly
- Make sure backend is running on port 3001
- Check CORS settings in `server/server.js`

### Authentication Errors
- Verify JWT_SECRET is set in backend `.env`
- Check that token is being stored in localStorage
- Clear browser localStorage and try again

## Next Steps

- Read `docs/API_DOCUMENTATION.md` for API details
- Read `docs/BACKEND_README.md` for backend architecture
- Read `docs/CONNECTION_REPORT.md` for connection verification

## Production Deployment

For production:
1. Use MongoDB Atlas or managed MongoDB service
2. Set strong JWT_SECRET
3. Configure proper CORS origins
4. Use environment variables for all secrets
5. Enable HTTPS
6. Set up proper error logging

