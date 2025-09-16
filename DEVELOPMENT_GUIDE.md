# BergHaus Food & Beverage Management System - Development Guide

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone and setup the project:**
```bash
cd c:\Users\jayvi\OneDrive\Desktop\berghaus
```

2. **Install Frontend Dependencies:**
```bash
cd client
npm install
```

3. **Install Backend Dependencies:**
```bash
cd ../server
npm install
```

4. **Environment Setup:**
   - Copy `server/.env.example` to `server/.env`
   - Copy `client/.env.local.example` to `client/.env.local`
   - Update environment variables with your configurations

5. **Start Development Servers:**

Backend (Terminal 1):
```bash
cd server
npm run dev
```

Frontend (Terminal 2):
```bash
cd client
npm run dev
```

## Project Overview

### Module Focus: Food & Beverage Management
- **Student**: Jayavi T.P.W.N (IT23682382)
- **Component**: Food & Beverage Management
- **Tech Stack**: Next.js, Express.js, MongoDB, TypeScript

### Key Features to Implement

#### Guest Features
- [ ] Browse menu with categories
- [ ] Search and filter menu items
- [ ] Place orders (room service/restaurant)
- [ ] Customize orders (dietary requests, portions)
- [ ] Real-time order tracking
- [ ] Order history
- [ ] Feedback system

#### Kitchen Staff Features
- [ ] Real-time order queue
- [ ] Update order status
- [ ] Manage menu availability
- [ ] Handle special requests
- [ ] View order details

#### Admin Features
- [ ] Menu management (CRUD operations)
- [ ] Dynamic pricing
- [ ] Category management
- [ ] Order management
- [ ] Sales reporting
- [ ] Food waste tracking
- [ ] User management

## Development Tasks

### Phase 1: Core Setup ✅
- [x] Project structure
- [x] Environment configuration
- [x] Basic TypeScript setup
- [x] Database models planning

### Phase 2: Authentication & User Management
- [ ] User registration/login
- [ ] JWT authentication
- [ ] Role-based access control
- [ ] User profile management

### Phase 3: Menu Management
- [ ] Menu item CRUD operations
- [ ] Category management
- [ ] Image upload (Cloudinary)
- [ ] Menu display for guests
- [ ] Search and filtering

### Phase 4: Order System
- [ ] Order placement
- [ ] Shopping cart functionality
- [ ] Order status tracking
- [ ] Real-time updates
- [ ] Order history

### Phase 5: Kitchen Interface
- [ ] Kitchen dashboard
- [ ] Order queue management
- [ ] Status updates
- [ ] Special requests handling

### Phase 6: Reporting & Analytics
- [ ] Sales reports
- [ ] Food waste tracking
- [ ] Inventory integration
- [ ] Performance metrics

### Phase 7: Advanced Features
- [ ] Real-time notifications
- [ ] Feedback system
- [ ] Dynamic pricing
- [ ] Mobile responsiveness

## File Structure Priority

### Essential Backend Files to Create:
1. **Models**: User, MenuItem, Order, Category
2. **Controllers**: Auth, Menu, Orders
3. **Routes**: API endpoints
4. **Middleware**: Authentication, validation
5. **Utils**: JWT, validation helpers

### Essential Frontend Files to Create:
1. **Pages**: Home, Menu, Orders, Dashboard
2. **Components**: Layout, UI components
3. **Contexts**: Auth, Orders
4. **Hooks**: API calls, state management
5. **Utils**: API client, formatters

## Database Schema

### Key Collections:
- **users**: Guest and staff accounts
- **menuitems**: Food and beverage items
- **categories**: Menu categorization
- **orders**: Customer orders
- **orderitems**: Individual order items
- **feedback**: Customer feedback
- **inventory**: Stock management (for integration)

## API Endpoints to Implement

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Menu Management
- GET /api/menu/items
- POST /api/menu/items (admin)
- PUT /api/menu/items/:id (admin)
- DELETE /api/menu/items/:id (admin)
- GET /api/menu/categories

### Orders
- POST /api/orders
- GET /api/orders (user's orders)
- GET /api/orders/:id
- PUT /api/orders/:id/status (kitchen)
- GET /api/orders/kitchen/queue (kitchen)

### Reports
- GET /api/reports/sales
- GET /api/reports/waste
- POST /api/reports/waste

## Development Tips

### Frontend Development
- Use TypeScript for type safety
- Implement responsive design with Tailwind CSS
- Use React Query for server state management
- Implement proper error handling
- Add loading states for better UX

### Backend Development
- Use proper error handling middleware
- Implement request validation
- Add rate limiting for security
- Use proper HTTP status codes
- Document API endpoints

### Database
- Design efficient schemas
- Add proper indexes
- Implement data validation
- Plan for scalability

## Testing Strategy
- Unit tests for utilities
- Integration tests for API endpoints
- Component tests for React components
- E2E tests for critical user flows

## Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations
- [ ] Image optimization
- [ ] Security headers
- [ ] Error monitoring
- [ ] Performance optimization

## Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Git Workflow
1. Create feature branches for each component
2. Use conventional commit messages
3. Regular commits with meaningful descriptions
4. Pull requests for code review
5. Keep main branch stable

## Next Steps
1. Set up local development environment
2. Install dependencies
3. Start with authentication system
4. Implement basic menu display
5. Build order placement functionality
6. Add kitchen management features
7. Implement reporting system

---

**Remember**: This is a university project, so focus on demonstrating key concepts like:
- Full-stack development skills
- Database design
- API development
- User interface design
- Real-time features
- Reporting and analytics
