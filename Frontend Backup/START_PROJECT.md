# Starting the MindSoothe Project

## Current Status

✅ Backend dependencies installed
✅ Frontend dependencies installed  
✅ Environment files created
⏳ Servers starting...

## MongoDB Setup Required

The backend requires MongoDB to be running. Choose one option:

### Option 1: Local MongoDB (Recommended for Development)

1. **Install MongoDB** (if not installed):
   - Download from: https://www.mongodb.com/try/download/community
   - Or use Chocolatey: `choco install mongodb`

2. **Start MongoDB Service**:
   ```powershell
   # Check if MongoDB service exists
   Get-Service MongoDB
   
   # Start MongoDB service
   Start-Service MongoDB
   ```

3. **Verify MongoDB is running**:
   ```powershell
   # Should show "Running"
   Get-Service MongoDB
   ```

### Option 2: MongoDB Atlas (Cloud - No Installation Needed)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier available)
4. Get your connection string
5. Update `server/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mindsoothe
   ```

## Starting the Servers

### Backend Server
The backend should be starting automatically. If not:

```powershell
cd server
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running on http://localhost:3001
```

### Frontend Server
The frontend should be starting automatically. If not:

```powershell
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

## Troubleshooting

### Backend won't start
- **Error: "MongoDB connection error"**
  - Make sure MongoDB is running (see above)
  - Check `MONGODB_URI` in `server/.env`
  - For MongoDB Atlas, ensure your IP is whitelisted

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check `VITE_API_URL` in root `.env` file
- Make sure CORS is configured correctly

### Port already in use
- Change `PORT=3001` in `server/.env` to a different port
- Update `VITE_API_URL` in frontend `.env` accordingly

## Next Steps

1. Ensure MongoDB is running
2. Wait for both servers to start
3. Open http://localhost:5173 in your browser
4. Sign up a new user to test the connection

## Testing the Connection

Run the connection test:
```powershell
cd server
node test-connection.js
```

This will verify:
- ✅ MongoDB connection
- ✅ Express server
- ✅ Authentication endpoints
- ✅ Journal endpoints

