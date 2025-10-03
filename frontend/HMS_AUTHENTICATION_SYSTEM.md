# 🏨 HMS Authentication System

## ✨ Features Implemented

### 🎨 **Modern UI Design**
- **Custom Color Palette**: Primary (#006bb8), Secondary (#2fa0df), Accent (#ffc973), Highlight (#fee3b3)
- **HMS Logo Integration**: Logo from `/assets/logo.jpg` in navbar and auth pages
- **Background Images**: Hotel photos from `/assets/` folder as hero backgrounds
- **Glassmorphism Effects**: Backdrop blur and transparency for modern look

### 🔐 **Authentication Components**
- **Login Page** (`/app/auth/login.tsx`): Modern login form with validation
- **Signup Page** (`/app/auth/signup.tsx`): Comprehensive registration form
- **Tab Switcher** (`/app/auth/page.tsx`): Smooth toggle between login/signup
- **Form Validation**: Real-time validation with error animations

### 🎭 **Interactive Elements**
- **Shake Animation**: Form fields shake on validation errors
- **Hover Effects**: Buttons scale and change colors on hover
- **Loading States**: Animated spinners during form submission
- **Success Toasts**: Beautiful toast notifications for successful actions
- **Smooth Transitions**: Fade and slide animations throughout

### 📱 **Responsive Design**
- **Mobile-First**: Optimized for all screen sizes
- **Tablet Support**: Perfect layout on medium screens
- **Desktop Enhanced**: Full-featured experience on large screens
- **Touch-Friendly**: Large tap targets and intuitive navigation

### 🧩 **Reusable Components**
- **Input Component**: With validation states and error styling
- **Button Component**: Multiple variants with loading animations
- **Card Component**: Consistent styling with hover effects
- **Alert Component**: Success and error message display
- **Toast System**: Non-intrusive notifications

### 🧭 **Navigation & Layout**
- **Navbar**: HMS logo, responsive menu, smooth animations
- **Footer**: Hotel details, contact info, social links
- **Landing Page**: Hero section with hotel photos and features
- **App Layout**: Consistent structure with toast provider

## 🚀 **Getting Started**

### **Installation**
```bash
cd frontend
npm install
```

### **Development**
```bash
npm run dev
```

### **Build**
```bash
npm run build
```

### **Type Check**
```bash
npm run type-check
```

## 📁 **File Structure**

```
frontend/
├── app/
│   ├── auth/
│   │   ├── page.tsx          # Tab switcher for login/signup
│   │   ├── login.tsx         # Login form component
│   │   └── signup.tsx        # Signup form component
│   ├── layout.tsx            # App layout with toast provider
│   ├── page.tsx              # Landing page with hero section
│   └── globals.css           # Global styles and animations
├── components/
│   ├── ui/
│   │   ├── input.tsx         # Input with validation states
│   │   ├── button.tsx        # Button with loading animation
│   │   ├── card.tsx          # Card wrapper component
│   │   ├── alert.tsx         # Alert for messages
│   │   ├── tabs.tsx          # Tab switcher component
│   │   ├── toast.tsx         # Toast notification
│   │   └── toaster.tsx       # Toast provider
│   ├── navbar.tsx            # Navigation with HMS logo
│   └── footer.tsx            # Footer with hotel details
├── hooks/
│   └── use-toast.ts          # Toast hook for notifications
├── assets/
│   ├── logo.jpg              # HMS logo
│   └── IMG-*.jpg             # Hotel background photos
└── tailwind.config.js        # Custom color palette & animations
```

## 🎯 **Key Features**

### **Form Validation**
- Real-time email validation
- Password strength checking
- Phone number validation
- Required field validation
- Error message display with animations

### **User Experience**
- Smooth page transitions
- Loading states with spinners
- Success/error feedback
- Responsive design
- Accessibility features

### **Authentication Flow**
1. User visits `/auth`
2. Chooses between Login/Signup tabs
3. Fills form with real-time validation
4. Submits with loading animation
5. Receives success toast
6. Redirects to dashboard with animation

### **Demo Credentials**
- **Admin**: admin@hms.com / Admin123
- **Employee**: employee@hms.com / Employee123
- **Guest**: guest@hms.com / Guest123

## 🎨 **Design System**

### **Colors**
- **Primary**: #006bb8 (HMS Blue)
- **Secondary**: #2fa0df (Light Blue)
- **Accent**: #ffc973 (Golden Yellow)
- **Highlight**: #fee3b3 (Light Cream)

### **Animations**
- **fade-in**: Smooth opacity transition
- **slide-up**: Vertical slide animation
- **shake**: Error state animation
- **pulse-slow**: Subtle attention grabber

### **Typography**
- **Font**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700
- **Sizes**: Responsive scaling

## 🔧 **Technical Stack**

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom config
- **Components**: shadcn/ui with custom variants
- **Icons**: Lucide React
- **Animations**: CSS keyframes + Tailwind
- **TypeScript**: Full type safety
- **Forms**: React hooks with validation

## 📱 **Responsive Breakpoints**

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎉 **Success!**

Your HMS authentication system is now complete with:
- ✅ Modern, clean UI design
- ✅ Interactive form validation
- ✅ Smooth animations and transitions
- ✅ Responsive design
- ✅ Toast notifications
- ✅ HMS branding and colors
- ✅ Hotel photos integration
- ✅ Reusable components

**Ready for production use!** 🚀
