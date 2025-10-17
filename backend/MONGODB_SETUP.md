# MongoDB Setup Guide

## Quick Start

### 1. Install MongoDB

**Option A: Local MongoDB**
- Windows: Download from https://www.mongodb.com/try/download/community
- macOS: `brew install mongodb-community`
- Linux: Follow instructions at https://docs.mongodb.com/manual/installation/

**Option B: MongoDB Atlas (Cloud - Recommended)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster (M0)
- Get your connection string

### 2. Configure Environment

Update `backend/.env`:
```
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/community-service

# Or MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/community-service
```

### 3. Install Dependencies & Seed Data

```bash
cd backend
npm install
npm run seed
```

### 4. Start Server

```bash
npm start
# or for development
npm run dev
```

## Test Credentials
- Email: `arjun@college.edu` | Password: `password`
- Email: `priya@college.edu` | Password: `password`

## Database Collections
- **users** - User accounts and profiles
- **events** - Community service events
- **registrations** - User event registrations
- **attendances** - Check-in/out records

## Troubleshooting
- Connection refused? Ensure MongoDB is running
- Authentication failed? Check credentials in MONGODB_URI
- For more help: https://docs.mongodb.com/
