# BergHaus Hotel Management System - Food & Beverage Module

A comprehensive food and beverage management system for the BergHaus Hotel, built with modern web technologies.

## Features

### Admin Dashboard
- **Menu Management**: Create, update, and delete menu items with categories
- **Order Management**: Track and update order statuses
- **Banner Management**: Create and manage promotional banners
- **Promotion Management**: Set up discounts, seasonal offers, and time-based promotions
- **Reports & Analytics**: Generate sales reports, waste analysis, and ingredient forecasts

### Guest Features
- **Menu Browsing**: View categorized menu items with meal-time suggestions
- **Order Customization**: Customize orders with dietary restrictions and preferences
- **Order Tracking**: View order history and cancel pending orders
- **Promotional Offers**: View active promotions and discounts

### Technical Features
- **Real-time Updates**: Live order status updates
- **Image Management**: Upload and manage menu item and banner images
- **Responsive Design**: Mobile-friendly interface
- **Authentication**: Secure admin login system

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Image Upload**: Multer

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Start the development servers:
   ```bash
   npm run dev
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## Usage

### Admin Access
- Login: http://localhost:3000/login
- Default credentials: admin / admin123

### Guest Access
- Menu: http://localhost:3000/guest/menu
- Orders: http://localhost:3000/guest/orders

## Project Structure

```
berghaus/
├── frontend/          # Next.js application
├── backend/           # Express.js API server
└── package.json       # Root package configuration
```

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile` - Get admin profile

### Menu Management
- `GET /api/menu` - Get all menu items
- `POST /api/admin/menu` - Create menu item
- `PUT /api/admin/menu/:id` - Update menu item
- `DELETE /api/admin/menu/:id` - Delete menu item

### Order Management
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

### Reports
- `GET /api/reports/daily-sales` - Daily sales report
- `GET /api/reports/food-waste` - Food waste analysis
- `GET /api/reports/ingredient-forecast` - Ingredient usage forecast

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

## Author

Jayavi T.P.W.N - IT23682382

## License

MIT
