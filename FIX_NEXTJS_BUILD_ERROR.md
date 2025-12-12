# Fix Next.js Build Error - Missing Prerender Manifest

## Error
```
Error: ENOENT: no such file or directory, open '/var/www/hms/frontend/.next/prerender-manifest.json'
```

This error means the Next.js build is incomplete or corrupted. The `.next` folder is missing required build files.

## Quick Fix

**Run these commands on your production server:**

```bash
# Navigate to frontend directory
cd /var/www/hms/frontend

# Stop the frontend process
pm2 stop hms-frontend

# Remove the corrupted build
rm -rf .next

# Optional: Clear node_modules cache (if issues persist)
rm -rf node_modules/.cache

# Rebuild the application
npm run build

# If build fails, try:
# npm install
# npm run build

# Start the frontend
pm2 start hms-frontend

# Check status
pm2 status
pm2 logs hms-frontend --lines 20
```

## Install Sharp for Image Optimization (Recommended)

Next.js recommends `sharp` for production image optimization:

```bash
cd /var/www/hms/frontend

# Install sharp
npm install sharp

# Rebuild
npm run build

# Restart
pm2 restart hms-frontend
```

## Complete Rebuild (If Above Doesn't Work)

If the issue persists, do a complete clean rebuild:

```bash
cd /var/www/hms/frontend

# Stop PM2
pm2 stop hms-frontend

# Remove all build artifacts and cache
rm -rf .next
rm -rf node_modules/.cache
rm -rf .next/cache

# Optional: Reinstall dependencies (if needed)
# npm install

# Rebuild
npm run build

# Verify build succeeded
ls -la .next/prerender-manifest.json
# Should show the file exists

# Start PM2
pm2 start hms-frontend

# Check logs
pm2 logs hms-frontend --lines 30
```

## Verify Build

**Check if build files exist:**
```bash
cd /var/www/hms/frontend

# Check for required build files
ls -la .next/prerender-manifest.json
ls -la .next/BUILD_ID
ls -la .next/server

# All should exist
```

## Common Causes

1. **Incomplete build** - Build was interrupted
2. **Corrupted cache** - Stale cache files
3. **Missing dependencies** - Packages not installed
4. **Disk space** - Not enough space during build
5. **Permissions** - Can't write to `.next` directory

## Check Disk Space

```bash
# Check available disk space
df -h

# Check frontend directory size
du -sh /var/www/hms/frontend
```

## Check Permissions

```bash
# Ensure proper permissions
cd /var/www/hms/frontend
chown -R $USER:$USER .next 2>/dev/null || true
chmod -R 755 .next 2>/dev/null || true
```

## After Fixing

1. **Test the application:**
   ```bash
   # Check if frontend is running
   pm2 status
   
   # Test in browser
   curl -I http://localhost:3000
   ```

2. **Check logs:**
   ```bash
   pm2 logs hms-frontend --lines 50
   # Should not show the ENOENT error
   ```

3. **Verify routes work:**
   - Visit: `https://berghausbungalow.live`
   - Try Google OAuth sign-in
   - Check callback route: `https://berghausbungalow.live/auth/google/callback`

## Prevention

To prevent this in the future:

1. **Always rebuild after code changes:**
   ```bash
   cd /var/www/hms/frontend
   git pull origin main
   npm run build
   pm2 restart hms-frontend
   ```

2. **Use PM2 ecosystem file** to ensure proper startup:
   ```json
   {
     "name": "hms-frontend",
     "script": "npm",
     "args": "start",
     "cwd": "/var/www/hms/frontend",
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Monitor build process:**
   - Check build output for errors
   - Verify `.next` folder is created
   - Check file sizes are reasonable

## Still Having Issues?

If the error persists:

1. **Check Node.js version:**
   ```bash
   node -v
   # Should be 18.x or 20.x
   ```

2. **Check npm version:**
   ```bash
   npm -v
   ```

3. **Check package.json:**
   ```bash
   cd /var/www/hms/frontend
   cat package.json | grep "next"
   # Verify Next.js version
   ```

4. **Full system check:**
   ```bash
   # Check PM2
   pm2 list
   
   # Check system resources
   free -h
   df -h
   
   # Check for other errors
   journalctl -u pm2-* --lines 50
   ```

