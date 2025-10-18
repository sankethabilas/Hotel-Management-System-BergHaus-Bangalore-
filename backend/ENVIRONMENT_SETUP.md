# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://Sanketh:Gv5T0YzYqgFCI6th@cluster0.6vyj3nr.mongodb.net/hms_database?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=hms_jwt_secret_key_2024_secure_random_string_12345
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=sankethabilaschk@gmail.com
EMAIL_PASSWORD=ehjz vieo quab rgyr
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# Security Configuration
BCRYPT_ROUNDS=12
```

## Security Notes

1. **Never commit `.env` files to version control**
2. **The connection string is now masked in terminal output for security**
3. **Use strong, unique passwords for production**
4. **Rotate secrets regularly**

## Setup Instructions

1. Copy the above content into a new file called `.env` in the `backend` directory
2. Replace the placeholder values with your actual configuration
3. Make sure `.env` is in your `.gitignore` file
4. Restart your server after creating the `.env` file

## Current Changes Made

- ✅ Moved hardcoded MongoDB URI to environment variable
- ✅ Added connection string masking in terminal output
- ✅ Updated `database.js` to use `process.env.MONGODB_URI`
- ✅ Updated `app.js` to use environment variables
- ✅ Updated `check-leaves.js` to use environment variables
- ✅ Added proper error handling for missing environment variables

## Files Modified

- `backend/config/database.js`
- `backend/app.js`
- `backend/check-leaves.js`
