# 📧 Alternative Email Services

If Gmail App Password setup is challenging, here are alternative email services you can use:

## 1. **Outlook/Hotmail (Easier Setup)**

### Configuration:
```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-regular-password
```

### Setup:
1. Use your regular Outlook password
2. No App Password required
3. Works immediately

## 2. **Yahoo Mail**

### Configuration:
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

### Setup:
1. Enable 2FA on Yahoo
2. Generate App Password
3. Use App Password in configuration

## 3. **Custom SMTP (Any Email Provider)**

### Configuration:
```env
EMAIL_SERVICE=custom
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
```

## 4. **Test Email Service (For Development)**

For testing purposes, you can use a service like Mailtrap or Ethereal:

### Ethereal Email (Free Testing):
```env
EMAIL_SERVICE=custom
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=ethereal-username
EMAIL_PASSWORD=ethereal-password
```

## 5. **Disable Email Service (Temporary)**

If you want to disable email sending temporarily:

### Update emailService.js:
```javascript
// Comment out the email sending in authController.js and bookingController.js
// Or set a flag to disable emails
const EMAIL_ENABLED = false;
```

## Quick Test with Outlook:

1. Create a new Outlook account or use existing
2. Update your .env file:
```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-outlook-password
```
3. Test: `node test-email-service.js`

This should work immediately without App Password setup!
