# HMS Deployment Guide for DigitalOcean

This guide will help you deploy your HMS application to a DigitalOcean Droplet with domain `berghausbungalow.live`.

## Prerequisites

- DigitalOcean account
- Domain `berghausbungalow.live` DNS access
- SSH key pair (or password for initial access)
- MongoDB database (Atlas or self-hosted)

---

## Step 1: Create DigitalOcean Droplet

1. Log into DigitalOcean dashboard
2. Click **Create** → **Droplets**
3. Choose:
   - **Image**: Ubuntu 22.04 (LTS)
   - **Plan**: Basic, Regular with **2GB RAM / 1 vCPU** (minimum) or higher
   - **Region**: Choose closest to your users
   - **Authentication**: Add your SSH key (recommended) or use password
4. Click **Create Droplet**
5. Note your Droplet's **IP address**

---

## Step 2: Point Domain to Droplet

1. Go to your domain registrar (where you bought `berghausbungalow.live`)
2. Find DNS management
3. Add/Update **A Record**:
   - **Name**: `@` (or leave blank for root domain)
   - **Type**: A
   - **Value**: Your Droplet IP address
   - **TTL**: 3600 (or default)
4. Optionally add **www** subdomain:
   - **Name**: `www`
   - **Type**: A
   - **Value**: Your Droplet IP address

**Note**: DNS propagation can take 5 minutes to 48 hours. You can proceed while waiting.

---

## Step 3: SSH into Your Droplet

From your local machine (PowerShell on Windows):

```bash
ssh root@YOUR_DROPLET_IP
```

If using password, DigitalOcean will email you the initial password.

---

## Step 4: Install System Dependencies

Run these commands on your Droplet:

```bash
# Update system packages
apt update && apt upgrade -y

# Install essential tools
apt install -y git build-essential curl

# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installation
node -v  # Should show v20.x.x
npm -v   # Should show 10.x.x

# Install PM2 globally (process manager)
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Certbot for SSL certificates
apt install -y certbot python3-certbot-nginx
```

---

## Step 5: Clone Your Repository

```bash
# Create directory for your app
mkdir -p /var/www
cd /var/www

# Clone your repository (replace with your actual repo URL)
# Option 1: If using GitHub/GitLab with SSH key
git clone git@github.com:YOUR_USERNAME/YOUR_REPO.git hms

# Option 2: If using HTTPS (you'll need to enter credentials)
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git hms

# Navigate to project
cd hms
```

**Alternative**: If your repo is private or you prefer, you can:
- Upload files via SCP
- Use `rsync` to sync from your local machine

---

## Step 6: Configure Backend Environment

```bash
cd /var/www/hms/backend

# Create .env file
nano .env
```

Add your backend environment variables (example):

```env
NODE_ENV=production
PORT=5000

# MongoDB connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hms?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email configuration (if using email service)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Other environment variables your app needs
```

Save and exit: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## Step 7: Configure Frontend Environment

```bash
cd /var/www/hms/frontend

# Create .env.production file
nano .env.production
```

Add:

```env
NEXT_PUBLIC_API_URL=https://berghausbungalow.live/api
```

Save and exit: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## Step 8: Install Dependencies and Build

### Backend:

```bash
cd /var/www/hms/backend

# Install dependencies
npm install

# Test that server starts (optional, press Ctrl+C to stop)
node server.js
```

### Frontend:

```bash
cd /var/www/hms/frontend

# Install dependencies
npm install

# Build the Next.js application
npm run build
```

This may take a few minutes. The build output should be in `.next` folder.

---

## Step 9: Start Services with PM2

### Start Backend:

```bash
cd /var/www/hms/backend

# Start with PM2
pm2 start server.js --name hms-backend

# Check status
pm2 status
```

### Start Frontend:

```bash
cd /var/www/hms/frontend

# Start Next.js production server with PM2
pm2 start npm --name hms-frontend -- start

# Check status
pm2 status
```

### Configure PM2 to start on reboot:

```bash
# Save current PM2 process list
pm2 save

# Generate startup script
pm2 startup systemd

# Follow the command it outputs (usually something like):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

---

## Step 10: Configure Nginx

### Create Nginx configuration:

```bash
nano /etc/nginx/sites-available/hms
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name berghausbungalow.live www.berghausbungalow.live;

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files (uploads)
    location /uploads/ {
        alias /var/www/hms/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Save and exit: `Ctrl+O`, `Enter`, `Ctrl+X`

### Enable the site:

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/hms /etc/nginx/sites-enabled/hms

# Remove default site (optional)
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# If test passes, reload Nginx
systemctl reload nginx
```

---

## Step 11: Set Up Firewall

```bash
# Allow SSH
ufw allow OpenSSH

# Allow HTTP and HTTPS
ufw allow 'Nginx Full'

# Enable firewall
ufw enable

# Check status
ufw status
```

---

## Step 12: Set Up SSL Certificate (HTTPS)

**Important**: Make sure your domain DNS has propagated before running this. You can check with:

```bash
ping berghausbungalow.live
```

If it resolves to your Droplet IP, proceed:

```bash
# Obtain SSL certificate
certbot --nginx -d berghausbungalow.live -d www.berghausbungalow.live

# Follow the prompts:
# - Enter your email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

Certbot will automatically:
- Obtain certificates from Let's Encrypt
- Update your Nginx configuration
- Set up auto-renewal

### Test certificate renewal:

```bash
certbot renew --dry-run
```

---

## Step 13: Verify Deployment

1. **Check PM2 processes:**
   ```bash
   pm2 status
   pm2 logs hms-backend
   pm2 logs hms-frontend
   ```

2. **Check Nginx:**
   ```bash
   systemctl status nginx
   ```

3. **Test in browser:**
   - Visit `https://berghausbungalow.live`
   - Try logging in
   - Test API endpoints (check browser DevTools → Network tab)

4. **Check backend logs if issues:**
   ```bash
   pm2 logs hms-backend --lines 50
   ```

---

## Step 14: Post-Deployment Checklist

- [ ] Frontend loads at `https://berghausbungalow.live`
- [ ] API calls work (check browser console for errors)
- [ ] Authentication/login works
- [ ] Database connection is working
- [ ] File uploads work (if applicable)
- [ ] PM2 processes restart after server reboot
- [ ] SSL certificate auto-renewal is set up

---

## Useful Commands

### PM2 Management:
```bash
pm2 status              # View all processes
pm2 logs hms-backend    # View backend logs
pm2 logs hms-frontend   # View frontend logs
pm2 restart hms-backend # Restart backend
pm2 restart hms-frontend # Restart frontend
pm2 stop all            # Stop all processes
pm2 start all           # Start all processes
```

### Nginx:
```bash
nginx -t                # Test configuration
systemctl reload nginx  # Reload configuration
systemctl restart nginx # Restart Nginx
systemctl status nginx # Check status
```

### View Logs:
```bash
# Application logs
pm2 logs

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

---

## Troubleshooting

### Frontend not loading:
- Check PM2: `pm2 status`
- Check Nginx: `systemctl status nginx`
- Check logs: `pm2 logs hms-frontend`

### API calls failing:
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.production`
- Check backend is running: `pm2 logs hms-backend`
- Verify Nginx proxy configuration

### SSL certificate issues:
- Ensure DNS has propagated: `ping berghausbungalow.live`
- Check firewall allows port 80: `ufw status`
- Re-run certbot: `certbot --nginx -d berghausbungalow.live`

### Database connection errors:
- Verify MongoDB URI in backend `.env`
- Check MongoDB network access (if using Atlas, whitelist Droplet IP)
- Test connection: `mongosh "your-connection-string"`

---

## Updating Your Application

When you need to update your code:

```bash
cd /var/www/hms

# Pull latest changes
git pull origin main  # or your branch name

# Backend updates
cd backend
npm install  # if package.json changed
pm2 restart hms-backend

# Frontend updates
cd ../frontend
npm install  # if package.json changed
npm run build
pm2 restart hms-frontend
```

---

## Security Recommendations

1. **Change default SSH port** (optional but recommended)
2. **Set up fail2ban** for SSH protection
3. **Regularly update system packages**: `apt update && apt upgrade`
4. **Use strong passwords** for database and JWT secrets
5. **Enable MongoDB authentication** if self-hosting
6. **Review and restrict** MongoDB network access
7. **Set up regular backups** of your database

---

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Verify environment variables are set correctly
4. Ensure all services are running: `pm2 status`

Good luck with your deployment! 🚀

