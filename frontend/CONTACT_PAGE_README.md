# Contact Us Page - BergHaus Hotel

## Overview
A beautiful, standalone contact page for the BergHaus Hotel Management System. This page is **completely separate** from the admin dashboard and features a modern, hotel-themed design.

## Color Palette
The page uses the specified color scheme:
- **Primary Blue**: `#006bb8` - Main brand color
- **Secondary Blue**: `#2fa0df` - Accent and hover effects
- **Primary Gold**: `#ffc973` - Call-to-action buttons
- **Light Gold**: `#fee3b3` - Background accents and highlights

## Features

### 1. **Hero Section**
- Full-width banner with hotel image
- Eye-catching gradient overlay using brand colors
- Hotel name and welcoming message

### 2. **Contact Information Cards**
Four beautiful cards displaying:
- 📍 **Location**: Hotel address
- 📞 **Phone Numbers**: Multiple contact lines
- 📧 **Email**: Various department emails
- 🕐 **Working Hours**: Service availability

### 3. **Contact Form**
A comprehensive form with:
- Full Name (with validation)
- Email Address (with email validation)
- Phone Number (with phone validation)
- Subject dropdown (Reservation, Booking, Services, Events, Feedback, Complaint, Other)
- Message textarea
- Real-time validation feedback
- Success notification on submission
- Beautiful icons for each field

### 4. **Interactive Map**
- Embedded Google Maps showing hotel location
- Fully interactive and responsive

### 5. **Additional Features**
- "Why Choose BergHaus?" section with key benefits
- Quick contact section for urgent matters
- Social media links
- Responsive footer
- Hover animations and transitions throughout

## How to Access

### For Visitors (Standalone Page)
Navigate to: **`http://localhost:5173/contact`**

This page is completely independent and doesn't require admin login.

### From Admin Dashboard (Optional)
You can add a link to the contact page from anywhere in your app:
```jsx
import { Link } from 'react-router-dom';

<Link to="/contact">Contact Us</Link>
```

## File Structure
```
frontend/src/
├── components/
│   └── contact/
│       └── ContactUs.jsx       # Main contact component
└── pages/
    └── ContactPage.jsx          # Page wrapper
```

## Usage

### Basic Setup
The page is already integrated into your app routes. Just navigate to `/contact` to see it.

### Customization

#### Update Hotel Information
Edit the `contactInfo` array in `ContactUs.jsx`:
```jsx
const contactInfo = [
  {
    icon: MapPin,
    title: 'Visit Us',
    details: ['Your Hotel Name', 'Your Address', 'City, State, Zip'],
    color: '#006bb8'
  },
  // ... more info
];
```

#### Update Google Maps Location
Replace the iframe `src` in the map section with your hotel's Google Maps embed URL.

#### Update Form Submission
Currently, form data is logged to console. To integrate with your backend:
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  const newErrors = validateForm();
  
  if (Object.keys(newErrors).length === 0) {
    try {
      // Add your API call here
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  }
};
```

## Responsive Design
- ✅ Mobile-friendly (< 768px)
- ✅ Tablet-optimized (768px - 1024px)
- ✅ Desktop-ready (> 1024px)
- ✅ Touch-friendly buttons and inputs
- ✅ Adaptive grid layouts

## Key Features

### Form Validation
- Required field validation
- Email format validation
- Phone number format validation
- Real-time error display
- User-friendly error messages

### User Experience
- Smooth animations and transitions
- Hover effects on cards and buttons
- Success message after form submission
- Auto-clearing form after submission
- Loading states during submission
- Icon-enhanced inputs for better UX

### Accessibility
- Semantic HTML structure
- Proper form labels
- ARIA-friendly components
- Keyboard navigation support
- Color contrast compliance

## Dependencies
The page uses:
- React
- React Router DOM
- Lucide React (for icons)
- Tailwind CSS (for styling)

All dependencies are already installed in your project.

## Browser Support
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Screenshots

### Desktop View
Full-width layout with side-by-side form and map.

### Mobile View
Stacked layout for optimal mobile viewing.

## Next Steps

1. **Test the page**: Navigate to `http://localhost:5173/contact`
2. **Customize content**: Update hotel details, images, and contact info
3. **Connect backend**: Integrate form submission with your API
4. **Add to navigation**: Link from your main website or landing page

## Support
For any issues or customization needs, refer to the component code in:
- `frontend/src/components/contact/ContactUs.jsx`

---

**Enjoy your new Contact Us page!** 🎉
