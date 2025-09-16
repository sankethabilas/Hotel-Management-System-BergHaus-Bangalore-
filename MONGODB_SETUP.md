# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/atlas
2. Click "Sign up" and create a free account
3. Verify your email address

### Step 2: Create a New Cluster
1. After logging in, click "Create a New Cluster"
2. Choose the FREE M0 Sandbox tier
3. Select a cloud provider and region (closest to your location)
4. Keep the default cluster name or change it to "berghaus-cluster"
5. Click "Create Cluster"

### Step 3: Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username: `berghaus_admin`
5. Enter a strong password (save this!)
6. Under "Database User Privileges", select "Read and write to any database"
7. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0) for development
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version 4.1 or later
5. Copy the connection string

### Step 6: Update Environment Variables
Replace the MONGODB_URI in your .env file with the connection string:

```
MONGODB_URI=mongodb+srv://berghaus_admin:<password>@berghaus-cluster.xxxxx.mongodb.net/berghaus_fnb?retryWrites=true&w=majority
```

**Important**: Replace `<password>` with the actual password you created for berghaus_admin

---

## Option 2: Local MongoDB Installation

### For Windows:
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. Install MongoDB as a Windows Service
4. MongoDB will be available at `mongodb://localhost:27017`

### For MongoDB Compass (GUI):
1. Download MongoDB Compass from https://www.mongodb.com/try/download/compass
2. Connect to your local MongoDB instance
3. Create a database named "berghaus_fnb"

---

## Next Steps After Setup

1. Update your .env file with the correct MONGODB_URI
2. Run the connection test: `npm run test:db`
3. If successful, start the development server: `npm run dev`

## MongoDB Atlas Advantages
- ✅ No local installation required
- ✅ Free tier available
- ✅ Automatic backups
- ✅ Built-in security features
- ✅ Easy scaling
- ✅ Access from anywhere

I recommend using MongoDB Atlas for your university project as it's more reliable and professional.
