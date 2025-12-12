# Fix "Route /auth/google/callback not found" Error

This error typically occurs when:
1. The route file exists but Next.js hasn't been rebuilt
2. The build cache is stale
3. Missing Suspense boundary (fixed in code)

## Quick Fix for Production

**On your production server, run these commands:**

```bash
# Navigate to frontend directory
cd /var/www/hms/frontend

# Pull latest code (if you just pushed)
git pull origin main

# Clear Next.js cache
rm -rf .next

# Rebuild the application
npm run build

# Restart the frontend
pm2 restart hms-frontend

# Check if it's running
pm2 status
pm2 logs hms-frontend --lines 20
```

## Verify Route Exists

**Check if the route file exists:**
```bash
ls -la /var/www/hms/frontend/app/auth/google/callback/page.tsx
# Should show the file exists
```

## Check Build Output

**After building, verify the route is included:**
```bash
# Check if route is in build output
ls -la /var/www/hms/frontend/.next/server/app/auth/google/callback/
# Should show page.js or similar files
```

## Alternative: Full Rebuild

**If the above doesn't work, do a full rebuild:**
```bash
cd /var/www/hms/frontend

# Remove all build artifacts
rm -rf .next
rm -rf node_modules/.cache

# Reinstall dependencies (optional, but safe)
npm install

# Rebuild
npm run build

# Restart
pm2 restart hms-frontend
```

## Verify Route is Working

**Test the route:**
```bash
# From your local machine or server
curl -I https://berghausbungalow.live/auth/google/callback
# Should return 200 OK (not 404)
```

## Common Issues

### Issue 1: Route Not in Build
**Symptom:** Route works locally but not in production

**Fix:**
- Ensure the file is committed to git
- Rebuild the application
- Check `.next` folder contains the route

### Issue 2: Stale Build Cache
**Symptom:** Changes not reflected after rebuild

**Fix:**
- Delete `.next` folder
- Rebuild from scratch
- Restart PM2

### Issue 3: Missing Suspense Boundary
**Symptom:** Route exists but throws error about useSearchParams

**Fix:**
- Already fixed in the code
- Ensure latest code is pulled and rebuilt

## After Fixing

1. **Test the route:**
   - Visit: `https://berghausbungalow.live/auth/google/callback?code=test`
   - Should show the callback page (not 404)

2. **Test Google OAuth:**
   - Try signing in with Google
   - Should redirect to callback page successfully

3. **Check logs:**
   ```bash
   pm2 logs hms-frontend
   # Look for any route-related errors
   ```

## Still Not Working?

If the route still doesn't work after rebuilding:

1. **Check Next.js version:**
   ```bash
   cd /var/www/hms/frontend
   cat package.json | grep "next"
   ```

2. **Check for route conflicts:**
   ```bash
   # Check if there's a conflicting route
   find /var/www/hms/frontend/app -name "*callback*" -type f
   ```

3. **Verify file permissions:**
   ```bash
   ls -la /var/www/hms/frontend/app/auth/google/callback/page.tsx
   # Should be readable
   ```

4. **Check PM2 logs for specific errors:**
   ```bash
   pm2 logs hms-frontend --err --lines 50
   ```

