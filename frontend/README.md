# Staff Management System - Frontend

A modern Next.js frontend application for managing staff members with full CRUD operations.

## Features

- **Staff List View**: Display all staff members with search functionality
- **Add Staff**: Create new staff members with comprehensive form
- **Edit Staff**: Update existing staff information
- **View Staff Details**: Detailed view of individual staff members
- **Delete Staff**: Remove staff members with confirmation
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with Tailwind CSS

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hooks** - State management

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend server running on `http://localhost:5000`

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Integration

The frontend connects to your backend API at `http://localhost:5000/staff` with the following endpoints:

- `GET /staff` - Get all staff members
- `POST /staff` - Create new staff member
- `GET /staff/:id` - Get staff member by ID
- `PUT /staff/:id` - Update staff member
- `DELETE /staff/:id` - Delete staff member

## Staff Form Fields

The staff form includes all fields from your backend model:

### Personal Information
- Employee ID (required)
- Full Name (required)
- Date of Birth (required)
- Gender (required)
- NIC/Passport (required)
- Phone (required)
- Email (required)
- Address

### Job Information
- Job Role (required)
- Department
- Join Date
- Salary (required)
- Overtime Rate
- Profile Picture URL

### Banking Information
- Bank Account
- Bank Name
- Branch

### Status
- Active/Inactive toggle

## Project Structure

```
Frontend/
├── src/
│   ├── app/
│   │   ├── add/page.tsx          # Add staff page
│   │   ├── edit/[id]/page.tsx    # Edit staff page
│   │   ├── staff/[id]/page.tsx   # Staff details page
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home page (staff list)
│   ├── components/
│   │   ├── Layout.tsx            # Main layout component
│   │   ├── StaffForm.tsx         # Staff form component
│   │   └── StaffList.tsx         # Staff list component
│   ├── services/
│   │   └── api.ts                # API service functions
│   └── types/
│       └── staff.ts              # TypeScript interfaces
├── package.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features Overview

### Staff List Page (`/`)
- Displays all staff members in a clean list format
- Search functionality across name, ID, email, and department
- Quick actions: View, Edit, Delete
- Responsive design for all screen sizes
- Loading states and error handling

### Add Staff Page (`/add`)
- Comprehensive form with all staff fields
- Form validation and error handling
- Organized sections: Personal, Job, Banking, Status
- Responsive form layout

### Edit Staff Page (`/edit/[id]`)
- Pre-populated form with existing staff data
- Same validation and layout as add form
- Updates existing staff member

### Staff Details Page (`/staff/[id]`)
- Detailed view of individual staff member
- All information organized in sections
- Edit and back navigation buttons
- Professional layout with proper spacing

## Error Handling

- API error messages displayed to users
- Loading states during data fetching
- Form validation with clear error messages
- Confirmation dialogs for destructive actions

## Responsive Design

- Mobile-first approach
- Responsive grid layouts
- Touch-friendly buttons and inputs
- Optimized for all screen sizes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

- All components are client-side rendered for interactivity
- TypeScript provides type safety throughout
- Tailwind CSS for consistent styling
- Modern React patterns with hooks
- Clean separation of concerns