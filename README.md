# HMS Reservation & Front Desk Management System

A comprehensive Hotel Management System built with **Express.js** (Node.js) backend and **Next.js** frontend, featuring user authentication, role-based access control, and a modern UI.

## 🚀 Features

### ✅ Implemented
- **User Authentication System**
  - User registration and login
  - JWT-based authentication
  - Password hashing with bcrypt
  - Role-based access control (Guest, Employee, Admin)
  - Profile management
  - Secure password validation

- **Backend Architecture**
  - MVC pattern with Express.js
  - MongoDB with Mongoose ODM
  - Input validation with express-validator
  - Security middleware (helmet, cors, rate limiting)
  - Error handling and logging

- **Frontend Interface**
  - Modern UI with Tailwind CSS
  - Responsive design
  - User registration and login forms
  - Dashboard with profile management
  - API integration with axios

### 🔄 Coming Soon
- Reservation management
- Room availability system
- Check-in/Check-out processes
- Guest services
- Reporting and analytics

## 🛠 Tech Stack

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose ODM**
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **helmet** for security headers
- **cors** for cross-origin requests

### Frontend
- **Next.js** (React framework)
- **Tailwind CSS** for styling
- **Axios** for API calls
- **js-cookie** for token management

## 📁 Project Structure

```
HMS 2/
├── backend/                 # Express.js backend
│   ├── config/             # Database and JWT configuration
│   ├── controllers/        # Business logic controllers
│   ├── middleware/         # Authentication and validation
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── server.js          # Main server file
│   └── package.json
├── frontend/               # Next.js frontend
│   ├── lib/               # API and auth utilities
│   ├── pages/             # Next.js pages
│   ├── styles/            # Global CSS and Tailwind
│   ├── next.config.js     # Next.js configuration
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "HMS 2"
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   Create `backend/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/hms
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

   Create `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**
   ```bash
   # Start both backend and frontend
   npm run dev
   
   # Or start individually:
   npm run server  # Backend only (port 5000)
   npm run client  # Frontend only (port 3000)
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Health check: http://localhost:5000/api/health

## 🔐 Demo Credentials

For testing purposes, you can use these demo accounts:

- **Admin**: admin@hms.com / Admin123
- **Employee**: employee@hms.com / Employee123  
- **Guest**: guest@hms.com / Guest123

*Note: These are demo credentials. In production, create real accounts through the registration system.*

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### User Management (Admin only)
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/deactivate` - Deactivate user
- `PUT /api/users/:id/activate` - Activate user

## 🔒 Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Controlled cross-origin requests
- **Security Headers**: Helmet.js for security headers
- **Role-based Access**: Different permissions for different user roles

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean, professional design with Tailwind CSS
- **Loading States**: User feedback during API calls
- **Error Handling**: Clear error messages and validation feedback
- **Accessibility**: Semantic HTML and keyboard navigation support

## 🧪 Testing the System

1. **Register a new account** at http://localhost:3000/register
2. **Login** with your credentials at http://localhost:3000/login
3. **Access the dashboard** to view and edit your profile
4. **Test different user roles** by registering with different account types

## 🚧 Development Roadmap

### Phase 1: User Management ✅
- [x] User registration and authentication
- [x] Role-based access control
- [x] Profile management
- [x] Admin user management

### Phase 2: Reservation System (Next)
- [ ] Room management
- [ ] Reservation booking
- [ ] Availability checking
- [ ] Booking modifications

### Phase 3: Front Desk Operations
- [ ] Check-in/Check-out processes
- [ ] Guest services
- [ ] Payment processing
- [ ] Housekeeping management

### Phase 4: Analytics & Reporting
- [ ] Dashboard analytics
- [ ] Revenue reports
- [ ] Occupancy reports
- [ ] Guest satisfaction tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the console logs for error messages
2. Ensure MongoDB is running and accessible
3. Verify all environment variables are set correctly
4. Check that all dependencies are installed

For additional support, please open an issue in the repository.

---

**Happy Coding! 🎉**
