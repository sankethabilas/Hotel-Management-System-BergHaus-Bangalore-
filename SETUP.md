# HMS Login Fix - Setup Instructions

## Issues Found and Fixed

1. **Missing .env file** - Backend needs environment variables
2. **AuthService method signature mismatch** - Fixed login method call
3. **Missing demo users** - Created setup script

## Quick Setup

### 1. Install MongoDB
Download and install MongoDB Community Server from: https://www.mongodb.com/try/download/community

Or use MongoDB Atlas (cloud):
- Create a free account at https://www.mongodb.com/atlas
- Create a cluster and get the connection string
- Update the MONGODB_URI in backend/.env

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with:
```
MONGODB_URI=mongodb://localhost:27017/hms
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Start MongoDB service, then:
```bash
npm run setup    # Creates demo users
npm start        # Starts the backend server
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Test Login
Visit http://localhost:3000/login and use these credentials:

- **Admin**: admin@hms.com / Admin123
- **Employee**: employee@hms.com / Employee123  
- **Guest**: guest@hms.com / Guest123

## Testing

### Backend API Test
```bash
cd backend
npm run test-login
```

### Manual Testing
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Visit http://localhost:3000/login
4. Try logging in with demo credentials

## Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running: `mongod`
- Check if port 27017 is available
- For Windows: Start MongoDB as a service

### Backend Not Starting
- Check if port 5000 is available
- Verify .env file exists and has correct values
- Check MongoDB connection

### Frontend Login Issues
- Verify backend is running on port 5000
- Check browser console for errors
- Ensure API_URL in frontend/lib/api.js is correct

## Files Modified

1. `frontend/lib/auth.js` - Fixed login method signature
2. `backend/create-demo-users.js` - Created demo user setup script
3. `backend/test-login.js` - Created login testing script
4. `backend/package.json` - Added setup and test scripts

## Environment Variables Needed

### Backend (.env)
- MONGODB_URI: MongoDB connection string
- JWT_SECRET: Secret key for JWT tokens
- JWT_EXPIRE: Token expiration time
- PORT: Backend server port
- NODE_ENV: Environment (development/production)
- FRONTEND_URL: Frontend URL for CORS

### Frontend (optional .env.local)
- NEXT_PUBLIC_API_URL: Backend API URL (defaults to http://localhost:5000/api)

