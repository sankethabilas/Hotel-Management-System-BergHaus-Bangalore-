# BergHaus Food & Beverage Management System

A comprehensive hotel management system focusing on food and beverage operations.

## Project Structure

### Frontend (Next.js)
- **client/**: Next.js application with TypeScript and Tailwind CSS
- **pages/**: Route-based pages for different user roles
- **components/**: Reusable UI components
- **hooks/**: Custom React hooks for state management
- **utils/**: Utility functions and API helpers

### Backend (Express.js)
- **server/**: Express.js API server
- **routes/**: API endpoint definitions
- **models/**: MongoDB schemas with Mongoose
- **middleware/**: Authentication and validation middleware
- **controllers/**: Business logic handlers

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **API**: RESTful APIs with JSON
- **Deployment**: Vercel (frontend), Render/Heroku (backend), MongoDB Atlas

## Features

### Guest Features
- Browse menu with images and descriptions
- Place orders from rooms
- Customize orders (dietary requests, portions)
- Track order status in real-time
- View order history
- Provide feedback

### Kitchen Staff Features
- View real-time orders
- Update order status
- Manage menu items
- Handle in-room dining requests
- Generate sales reports
- Track food waste

### Admin Features
- Dynamic pricing management
- Menu categorization
- Promotions and offers
- Comprehensive reporting
- Inventory integration

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Git

### Installation

1. Clone the repository
2. Install frontend dependencies: `cd client && npm install`
3. Install backend dependencies: `cd server && npm install`
4. Set up environment variables
5. Run development servers

## Development Guidelines

- Use TypeScript for type safety
- Follow REST API conventions
- Implement proper error handling
- Use environment variables
- Follow component-based architecture
- Ensure responsive design
- Write clean, documented code

## Student Information

- **Student**: Jayavi T.P.W.N (IT23682382)
- **Course**: Information Technology Project (IT2080) - 2025
- **Group**: ITP25_B2_W235
- **Module**: Food & Beverage Management
