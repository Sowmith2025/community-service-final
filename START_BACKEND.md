# 🚀 Backend Startup Guide

## Quick Start

### Prerequisites
- **Node.js** installed (v14 or higher)
- **MongoDB** running locally (default: localhost:27017)

### Step 1: Start MongoDB
```powershell
# If MongoDB is installed as a service, it should auto-start
# To check if MongoDB is running:
Get-Process mongod

# If not running, start it:
mongod
```

### Step 2: Install Backend Dependencies
```powershell
cd "c:\Users\sowmi\OneDrive\Desktop\src\Boosting student Engagement in Community service\backend"
npm install
```

### Step 3: Start Backend Server
```powershell
# For development (with auto-reload):
npm run dev

# Or for production:
npm start
```

### Step 4: Verify Backend is Running
- Check console output - should see: `🚀 Server running on port 5000`
- Visit: http://localhost:5000/api/health
- Expected response: `{"status":"OK","message":"Community Service API is running!"}`

---

## What Was Fixed

### ✅ Backend Issues Resolved
1. **Event Model Corruption** - The `Event.js` model file was corrupted (contained router code instead of schema)
   - Fixed: Recreated proper Mongoose schema with all required fields
   
2. **Better Error Logging** - Added detailed console logging to the events route
   - Logs: Which step failed, database queries, error details
   - Helps debug issues faster

### ✅ Frontend Improvements
1. **Health Check** - Frontend now checks if backend is responsive before fetching data
2. **Detailed Error Messages** - Shows specific troubleshooting steps based on error type
3. **Better Logging** - Console shows step-by-step initialization process
4. **Graceful Degradation** - If profile fails to load, still shows events

---

## Troubleshooting

### Issue: "Cannot connect to backend server"
**Solution:**
```powershell
# 1. Check if backend is running
Get-Process node

# 2. Check if port 5000 is in use
Get-NetTCPConnection -LocalPort 5000

# 3. Kill process if needed and restart
Stop-Process -Name node -Force
cd "backend"; npm start
```

### Issue: "MongoDB connection failed"
**Solution:**
```powershell
# 1. Check if MongoDB is running
Get-Process mongod

# 2. Start MongoDB
mongod

# 3. Check MongoDB connection string in .env
# Should be: MONGODB_URI=mongodb://localhost:27017/community-service
```

### Issue: "Invalid response format from events API"
**Solution:**
- The Event model was likely corrupted (already fixed)
- Check backend console for more detailed error messages
- Ensure database has some initial data or seed it:
  ```powershell
  npm run seed
  ```

---

## Check Backend Status

Open PowerShell in backend folder and run:
```powershell
# Check if server is responding
$health = Invoke-RestMethod -Uri "http://localhost:5000/api/health"
$health

# Should see:
# status  : OK
# message : Community Service API is running!
```