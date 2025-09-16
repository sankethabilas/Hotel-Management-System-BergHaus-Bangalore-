# Project Structure

This document outlines the complete file structure for the BergHaus Food & Beverage Management System.

## Root Directory Structure

```
berghaus/
├── README.md                          # Project documentation
├── .gitignore                         # Git ignore file
├── .github/
│   └── copilot-instructions.md        # GitHub Copilot instructions
├── client/                            # Next.js Frontend Application
└── server/                            # Express.js Backend Application
```

## Frontend Structure (client/)

```
client/
├── package.json                       # Frontend dependencies
├── next.config.js                     # Next.js configuration
├── tsconfig.json                      # TypeScript configuration
├── tailwind.config.js                 # Tailwind CSS configuration
├── postcss.config.js                  # PostCSS configuration
├── .env.local.example                 # Environment variables example
├── public/                            # Static assets
│   ├── favicon.ico
│   ├── images/
│   └── icons/
└── src/                               # Source code
    ├── pages/                         # Next.js pages (App Router)
    │   ├── _app.tsx                   # App wrapper
    │   ├── _document.tsx              # Document wrapper
    │   ├── index.tsx                  # Home page
    │   ├── auth/
    │   │   ├── login.tsx              # Login page
    │   │   ├── register.tsx           # Registration page
    │   │   └── forgot-password.tsx    # Password reset
    │   ├── guest/                     # Guest user pages
    │   │   ├── menu.tsx               # Browse menu
    │   │   ├── order.tsx              # Place order
    │   │   ├── orders/
    │   │   │   ├── index.tsx          # Order history
    │   │   │   └── [id].tsx           # Order details
    │   │   └── profile.tsx            # Guest profile
    │   ├── admin/                     # Admin pages
    │   │   ├── dashboard.tsx          # Admin dashboard
    │   │   ├── menu/
    │   │   │   ├── index.tsx          # Menu management
    │   │   │   ├── add.tsx            # Add menu item
    │   │   │   └── [id]/edit.tsx      # Edit menu item
    │   │   ├── orders/
    │   │   │   ├── index.tsx          # Order management
    │   │   │   └── [id].tsx           # Order details
    │   │   ├── reports/
    │   │   │   ├── sales.tsx          # Sales reports
    │   │   │   ├── waste.tsx          # Waste reports
    │   │   │   └── inventory.tsx      # Inventory reports
    │   │   └── users.tsx              # User management
    │   └── kitchen/                   # Kitchen staff pages
    │       ├── dashboard.tsx          # Kitchen dashboard
    │       ├── orders/
    │       │   ├── index.tsx          # Active orders
    │       │   └── [id].tsx           # Order details
    │       └── menu.tsx               # Menu status management
    ├── components/                    # Reusable components
    │   ├── layout/
    │   │   ├── Layout.tsx             # Main layout wrapper
    │   │   ├── Header.tsx             # Header component
    │   │   ├── Footer.tsx             # Footer component
    │   │   ├── Sidebar.tsx            # Sidebar navigation
    │   │   └── Navigation.tsx         # Navigation menu
    │   ├── ui/                        # UI components
    │   │   ├── Button.tsx             # Button component
    │   │   ├── Input.tsx              # Input component
    │   │   ├── Modal.tsx              # Modal component
    │   │   ├── Card.tsx               # Card component
    │   │   ├── Table.tsx              # Table component
    │   │   ├── Loading.tsx            # Loading spinner
    │   │   └── Alert.tsx              # Alert component
    │   ├── guest/                     # Guest-specific components
    │   │   ├── MenuCard.tsx           # Menu item card
    │   │   ├── OrderSummary.tsx       # Order summary
    │   │   ├── OrderTracking.tsx      # Order status tracking
    │   │   └── FeedbackForm.tsx       # Feedback form
    │   ├── admin/                     # Admin-specific components
    │   │   ├── MenuItemForm.tsx       # Menu item form
    │   │   ├── OrderTable.tsx         # Orders table
    │   │   ├── SalesChart.tsx         # Sales analytics
    │   │   └── UserTable.tsx          # Users table
    │   └── kitchen/                   # Kitchen-specific components
    │       ├── OrderQueue.tsx         # Order queue display
    │       ├── OrderCard.tsx          # Individual order card
    │       └── StatusUpdater.tsx      # Order status updater
    ├── hooks/                         # Custom React hooks
    │   ├── useAuth.ts                 # Authentication hook
    │   ├── useOrders.ts               # Orders management hook
    │   ├── useMenu.ts                 # Menu management hook
    │   ├── useSocket.ts               # Socket.io hook
    │   └── useLocalStorage.ts         # Local storage hook
    ├── utils/                         # Utility functions
    │   ├── api.ts                     # API client configuration
    │   ├── auth.ts                    # Authentication utilities
    │   ├── formatters.ts              # Data formatting functions
    │   ├── validators.ts              # Form validation
    │   └── constants.ts               # Application constants
    ├── types/                         # TypeScript type definitions
    │   └── index.ts                   # All type definitions
    ├── contexts/                      # React contexts
    │   ├── AuthContext.tsx            # Authentication context
    │   ├── OrderContext.tsx           # Order management context
    │   └── ThemeContext.tsx           # Theme context
    └── styles/                        # CSS and styling
        └── globals.css                # Global styles
```

## Backend Structure (server/)

```
server/
├── package.json                       # Backend dependencies
├── tsconfig.json                      # TypeScript configuration
├── .env.example                       # Environment variables example
├── .eslintrc.js                       # ESLint configuration
├── jest.config.js                     # Jest testing configuration
├── nodemon.json                       # Nodemon configuration
└── src/                               # Source code
    ├── server.ts                      # Main server file
    ├── config/                        # Configuration files
    │   ├── database.ts                # Database connection
    │   ├── cloudinary.ts              # Cloudinary configuration
    │   └── email.ts                   # Email service configuration
    ├── models/                        # MongoDB models
    │   ├── User.ts                    # User model
    │   ├── MenuItem.ts                # Menu item model
    │   ├── Order.ts                   # Order model
    │   ├── Category.ts                # Category model
    │   ├── Inventory.ts               # Inventory model
    │   ├── Feedback.ts                # Feedback model
    │   └── Report.ts                  # Report model
    ├── controllers/                   # Route controllers
    │   ├── authController.ts          # Authentication controller
    │   ├── userController.ts          # User management controller
    │   ├── menuController.ts          # Menu management controller
    │   ├── orderController.ts         # Order management controller
    │   ├── inventoryController.ts     # Inventory controller
    │   ├── reportController.ts        # Report generation controller
    │   └── feedbackController.ts      # Feedback controller
    ├── routes/                        # API routes
    │   ├── auth.ts                    # Authentication routes
    │   ├── users.ts                   # User routes
    │   ├── menu.ts                    # Menu routes
    │   ├── orders.ts                  # Order routes
    │   ├── inventory.ts               # Inventory routes
    │   ├── reports.ts                 # Report routes
    │   └── feedback.ts                # Feedback routes
    ├── middleware/                    # Express middleware
    │   ├── auth.ts                    # Authentication middleware
    │   ├── roles.ts                   # Role-based access control
    │   ├── validation.ts              # Request validation
    │   ├── upload.ts                  # File upload middleware
    │   ├── errorHandler.ts            # Error handling
    │   ├── notFound.ts                # 404 handler
    │   └── rateLimiter.ts             # Rate limiting
    ├── utils/                         # Utility functions
    │   ├── jwt.ts                     # JWT utilities
    │   ├── email.ts                   # Email sending utilities
    │   ├── fileUpload.ts              # File upload utilities
    │   ├── validators.ts              # Data validation
    │   ├── helpers.ts                 # General helper functions
    │   └── constants.ts               # Application constants
    ├── types/                         # TypeScript interfaces
    │   ├── auth.ts                    # Authentication types
    │   ├── user.ts                    # User types
    │   ├── menu.ts                    # Menu types
    │   ├── order.ts                   # Order types
    │   └── common.ts                  # Common types
    └── tests/                         # Test files
        ├── auth.test.ts               # Authentication tests
        ├── menu.test.ts               # Menu tests
        ├── orders.test.ts             # Order tests
        └── utils/                     # Test utilities
            └── testHelpers.ts         # Test helper functions
```

## Key Configuration Files

### Frontend Environment Variables (.env.local)
- NEXT_PUBLIC_API_URL: Backend API URL
- NEXT_PUBLIC_SOCKET_URL: Socket.io server URL
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: Cloudinary cloud name

### Backend Environment Variables (.env)
- NODE_ENV: Environment (development/production)
- PORT: Server port
- MONGODB_URI: MongoDB connection string
- JWT_SECRET: JWT signing secret
- CLOUDINARY_*: Cloudinary configuration
- EMAIL_*: Email service configuration

## Development Workflow

1. **Frontend Development**: Use `npm run dev` in the client directory
2. **Backend Development**: Use `npm run dev` in the server directory
3. **Database**: MongoDB with Mongoose ODM
4. **Authentication**: JWT with httpOnly cookies
5. **File Uploads**: Cloudinary for image storage
6. **Real-time Updates**: Socket.io for order status updates

## Deployment Strategy

- **Frontend**: Vercel (recommended for Next.js)
- **Backend**: Render, Heroku, or Railway
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary
- **Environment**: Production environment variables

## Security Features

- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet.js for security headers
- bcrypt for password hashing
