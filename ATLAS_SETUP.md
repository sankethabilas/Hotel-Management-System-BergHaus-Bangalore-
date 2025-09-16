# Quick MongoDB Atlas Setup for BergHaus Project

## Step-by-Step Guide

### 1. Create MongoDB Atlas Account
- Go to: https://www.mongodb.com/atlas
- Click "Sign up" or "Try Free"
- Use your university email if possible

### 2. Create Your First Cluster
- After verification, you'll see "Create a cluster"
- Choose **FREE M0 Sandbox** (it's completely free)
- Select **AWS** as provider
- Choose region closest to Sri Lanka (Singapore/Mumbai)
- Cluster Name: `berghaus-cluster`
- Click "Create Cluster"

### 3. Create Database User
- Click "Database Access" (left sidebar)
- Click "Add New Database User"
- Authentication Method: **Password**
- Username: `berghaus_admin`
- Password: Create a strong password (save it!)
- Database User Privileges: **Read and write to any database**
- Click "Add User"

### 4. Configure Network Access
- Click "Network Access" (left sidebar)
- Click "Add IP Address"
- Click "ALLOW ACCESS FROM ANYWHERE" (for development)
- Click "Confirm"

### 5. Get Connection String
- Go back to "Clusters"
- Click "Connect" button on your cluster
- Select "Connect your application"
- Driver: **Node.js**
- Version: **4.1 or later**
- Copy the connection string

### 6. Update Your .env File
Replace the MONGODB_URI in your `.env` file:

```env
# Replace this line:
MONGODB_URI=mongodb://localhost:27017/berghaus_fnb

# With this (replace <password> with your actual password):
MONGODB_URI=mongodb+srv://berghaus_admin:<password>@berghaus-cluster.xxxxx.mongodb.net/berghaus_fnb?retryWrites=true&w=majority
```

### 7. Test the Connection
```bash
npm run test:db
```

If successful, you should see:
```
✅ MongoDB Connected Successfully!
✅ Test document created successfully!
```

### 8. Seed Sample Data (Optional)
```bash
npm run seed
```

This will create sample users:
- Admin: admin@berghaus.com / admin123
- Kitchen: kitchen@berghaus.com / kitchen123
- Manager: manager@berghaus.com / manager123
- Guest: john.guest@email.com / guest123

## Troubleshooting

### Common Issues:
1. **Authentication Error**: Check username/password in connection string
2. **Network Error**: Make sure IP address is whitelisted
3. **Connection Timeout**: Check if cluster is still starting up (takes a few minutes)

### Your Connection String Should Look Like:
```
mongodb+srv://berghaus_admin:YOUR_PASSWORD@berghaus-cluster.abcde.mongodb.net/berghaus_fnb?retryWrites=true&w=majority
```

## Next Steps After Setup:
1. Test connection: `npm run test:db`
2. Seed data: `npm run seed`
3. Start server: `npm run dev`
4. Your API will be running at: http://localhost:5000

## MongoDB Atlas Dashboard
- View your data: Go to Clusters → Browse Collections
- Monitor usage: Check metrics and performance
- Manage users: Database Access section
- Security: Network Access section

**Note**: Keep your connection string secure and never commit it to Git!
