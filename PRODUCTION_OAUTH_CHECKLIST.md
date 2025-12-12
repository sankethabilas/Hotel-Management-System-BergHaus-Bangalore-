# Production OAuth Authentication Checklist

If Google OAuth is failing in production, use this checklist to diagnose and fix the issue.

## 🔍 Quick Diagnosis

Based on your error, Google OAuth redirect is working (you're getting the code), but the callback processing is failing.

### Step 1: Check Browser Console

1. Open your production site: `https://berghausbungalow.live`
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Try Google Sign-In again
5. Look for error messages - they should now be more specific

### Step 2: Check Server Logs

**On your production server, check logs:**

```bash
# Check frontend logs
pm2 logs hms-frontend --lines 50

# Check backend logs  
pm2 logs hms-backend --lines 50

# Or check recent logs
pm2 logs --lines 100
```

Look for:
- "Sending user data to backend" - confirms Google OAuth worked
- "Backend connection error" - backend not reachable
- "Backend server error" - backend returned an error

## 🔧 Common Issues and Fixes

### Issue 1: Backend Not Accessible

**Symptoms:**
- Error: "Unable to connect to backend server"
- Network error in console

**Fix:**

1. **Check if backend is running:**
   ```bash
   pm2 status
   # Should show hms-backend as "online"
   ```

2. **Check backend URL:**
   ```bash
   # On your server
   cd /var/www/hms/frontend
   cat .env.production
   # Should show: NEXT_PUBLIC_API_URL=https://berghausbungalow.live/api
   ```

3. **Test backend endpoint:**
   ```bash
   # On your server
   curl https://berghausbungalow.live/api/users/google-signup
   # Should return an error (expected) but confirms backend is accessible
   ```

4. **Restart frontend after changing .env:**
   ```bash
   cd /var/www/hms/frontend
   npm run build
   pm2 restart hms-frontend
   ```

### Issue 2: Environment Variables Not Set

**Symptoms:**
- Generic "Authentication failed" error
- Backend URL defaults to localhost

**Fix:**

1. **Check frontend .env.production:**
   ```bash
   cd /var/www/hms/frontend
   cat .env.production
   ```
   
   Should contain:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here
   NEXT_PUBLIC_API_URL=https://berghausbungalow.live/api
   ```

2. **Check backend .env:**
   ```bash
   cd /var/www/hms/backend
   cat .env
   ```
   
   Should contain:
   ```env
   GOOGLE_CLIENT_ID=your-client-id-here
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   ```

3. **Rebuild and restart:**
   ```bash
   # Frontend
   cd /var/www/hms/frontend
   npm run build
   pm2 restart hms-frontend
   
   # Backend
   cd /var/www/hms/backend
   pm2 restart hms-backend
   ```

### Issue 3: Backend Route Not Working

**Symptoms:**
- 404 error
- "Backend endpoint not found"

**Fix:**

1. **Verify backend route exists:**
   ```bash
   # Check backend routes
   cd /var/www/hms/backend
   grep -r "google-signup" routes/
   # Should show: router.post('/google-signup', googleSignup);
   ```

2. **Test backend endpoint directly:**
   ```bash
   curl -X POST https://berghausbungalow.live/api/users/google-signup \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@test.com","profilePic":"","accountType":"guest"}'
   ```

3. **Check backend server is listening:**
   ```bash
   netstat -tlnp | grep 5000
   # Should show backend listening on port 5000
   ```

### Issue 4: CORS Issues

**Symptoms:**
- CORS error in browser console
- Network request blocked

**Fix:**

1. **Check backend CORS configuration:**
   ```bash
   cd /var/www/hms/backend
   grep -r "cors" app.js server.js
   ```

2. **Ensure CORS allows your frontend domain:**
   ```javascript
   // Should allow: https://berghausbungalow.live
   app.use(cors({
     origin: ['https://berghausbungalow.live', 'http://localhost:3000'],
     credentials: true
   }));
   ```

### Issue 5: Database Connection

**Symptoms:**
- Backend error in logs
- "Failed to create user account"

**Fix:**

1. **Check MongoDB connection:**
   ```bash
   cd /var/www/hms/backend
   cat .env | grep MONGO_URI
   ```

2. **Test MongoDB connection:**
   ```bash
   # On your server
   mongosh "your-mongodb-connection-string"
   ```

3. **Check backend logs for database errors:**
   ```bash
   pm2 logs hms-backend | grep -i mongo
   ```

## 📋 Production Deployment Checklist

Before deploying, ensure:

- [ ] **Frontend `.env.production` exists:**
  ```env
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-production-client-id
  NEXT_PUBLIC_API_URL=https://berghausbungalow.live/api
  ```

- [ ] **Backend `.env` has Google OAuth credentials:**
  ```env
  GOOGLE_CLIENT_ID=your-production-client-id
  GOOGLE_CLIENT_SECRET=your-production-client-secret
  ```

- [ ] **Google Cloud Console configured:**
  - Authorized redirect URI: `https://berghausbungalow.live/auth/google/callback`
  - Authorized JavaScript origin: `https://berghausbungalow.live`

- [ ] **Backend is running:**
  ```bash
  pm2 status
  ```

- [ ] **Frontend is built and running:**
  ```bash
  pm2 status
  ```

- [ ] **Nginx is configured correctly:**
  - Frontend proxy: `http://127.0.0.1:3000`
  - Backend proxy: `http://127.0.0.1:5000`

## 🚀 Quick Fix Commands

**If you just updated environment variables:**

```bash
# On your production server
cd /var/www/hms

# Pull latest code
git pull origin main

# Frontend
cd frontend
npm install  # if package.json changed
npm run build
pm2 restart hms-frontend

# Backend
cd ../backend
npm install  # if package.json changed
pm2 restart hms-backend

# Check status
pm2 status
pm2 logs --lines 20
```

## 🔍 Debug Mode

To see more detailed errors, temporarily enable debug logging:

**Frontend (Next.js API route):**
- Errors are already logged to console
- Check PM2 logs: `pm2 logs hms-frontend`

**Backend:**
- Check PM2 logs: `pm2 logs hms-backend`
- Look for "Google signup error" messages

## 📞 Still Having Issues?

1. **Check the exact error message** in browser console
2. **Check server logs** for detailed error information
3. **Verify all environment variables** are set correctly
4. **Test backend endpoint** directly with curl
5. **Verify Google Cloud Console** redirect URI matches exactly

## Common Error Messages

| Error Message | Likely Cause | Solution |
|--------------|--------------|----------|
| "Unable to connect to backend server" | Backend not running or wrong URL | Check PM2 status, verify backend URL |
| "Backend endpoint not found" | Route not configured | Check backend routes, restart backend |
| "Backend server error (500)" | Database or server error | Check backend logs |
| "Authorization code expired" | Code expired | Try signing in again |
| "Redirect URI mismatch" | Google Cloud Console config | Add correct redirect URI |

