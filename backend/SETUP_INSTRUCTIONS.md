# HMS Backend Setup Instructions

## Database Connection and Email Service Fix

### Issue
The HMS backend was failing because:
1. No `.env` file exists with environment variables
2. Database connection was failing due to missing MongoDB URI
3. Email service was not configured with Gmail credentials

### Solution

**STEP 1: Create the .env file**

Create a new file called `.env` in the `backend` directory with the following content:

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

**STEP 2: Verify the setup**

1. Open a terminal in the `backend` directory
2. Run: `npm start`
3. You should see:
   - ✅ MongoDB connected successfully
   - ✅ Email service is ready to send messages
   - 🚀 Server running on port 5000

**STEP 3: Test the services**

1. **Database Test**: The server should connect to MongoDB Atlas successfully
2. **Email Test**: Run `node test-email-service.js` to test email functionality
3. **Health Check**: Visit `http://localhost:5000/api/health` to verify the server is running

### What's Fixed

✅ **Database Connection**: MongoDB Atlas connection configured with provided URI
✅ **Email Service**: Gmail SMTP configured with app password authentication
✅ **JWT Authentication**: Secure JWT secret configured
✅ **Server Configuration**: All required environment variables set

### Files Created/Modified

- `backend/.env` - Environment configuration (you need to create this manually)
- `backend/setup-env.js` - Automated setup script
- `backend/create-env.bat` - Windows batch file for setup
- `backend/create-env.ps1` - PowerShell script for setup
- `backend/test-email-service.js` - Email service test script
- `backend/ENVIRONMENT_SETUP.md` - Updated with complete configuration
- `backend/SETUP_INSTRUCTIONS.md` - This setup guide

### Next Steps

1. **Create the .env file manually** using the content above
2. **Start the server**: `npm start`
3. **Test the services**: Run the test scripts to verify everything works
4. **Start the frontend**: Navigate to frontend directory and run `npm run dev`

### Troubleshooting

If you encounter issues:

1. **Database Connection Failed**: Check if the MongoDB URI is correct and accessible
2. **Email Service Failed**: Verify Gmail app password is correct and 2FA is enabled
3. **Server Won't Start**: Check if port 5000 is available and all dependencies are installed

### Security Notes

- The `.env` file contains sensitive information and should never be committed to version control
- The MongoDB URI and email credentials are already configured for this specific setup
- For production, use stronger JWT secrets and different credentials
