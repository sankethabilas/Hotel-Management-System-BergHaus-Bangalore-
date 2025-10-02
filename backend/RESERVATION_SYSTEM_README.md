# Hotel Management System - Reservation Module

## Overview
This module implements a comprehensive reservation management system for the Hotel Management System (HMS) using Express.js, MongoDB, and Mongoose. It follows MVC architecture with proper separation of concerns.

## Architecture

### Models (Mongoose Schemas)
- **Room**: Manages room information, availability, and pricing
- **Reservation**: Handles booking data, guest information, and payment status

### Services (Business Logic)
- **ReservationService**: Core reservation operations and business rules
- **RoomService**: Room management and availability checking

### Controllers (HTTP Request Handlers)
- **ReservationController**: Handles reservation-related HTTP requests
- **RoomController**: Manages room-related HTTP requests

### Middleware
- **Authentication**: JWT-based user authentication
- **Validation**: Request validation using express-validator
- **Authorization**: Role-based access control

## Database Models

### Room Model
```javascript
{
  roomNumber: String (unique, required),
  roomType: String (Single|Double|Suite, required),
  pricePerNight: Number (required, min: 0),
  status: String (available|reserved|occupied, default: available),
  capacity: Number (required, min: 1),
  amenities: [String],
  description: String,
  images: [String]
}
```

### Reservation Model
```javascript
{
  guestId: ObjectId (ref: User, required),
  roomId: ObjectId (ref: Room, required),
  checkIn: Date (required, future date),
  checkOut: Date (required, after checkIn),
  totalPrice: Number (required, min: 0),
  status: String (pending|confirmed|cancelled, default: pending),
  paymentStatus: String (unpaid|paid, default: unpaid),
  guestCount: {
    adults: Number (required, min: 1),
    children: Number (default: 0, min: 0)
  },
  specialRequests: String (max: 500 chars),
  cancellationReason: String
}
```

## API Endpoints

### Room Endpoints

#### Public Endpoints (No Authentication Required)
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/available` - Get available rooms
- `GET /api/rooms/type/:roomType` - Get rooms by type
- `GET /api/rooms/search` - Search rooms with filters
- `GET /api/rooms/:id` - Get room by ID
- `GET /api/rooms/number/:roomNumber` - Get room by number

#### Protected Endpoints (Authentication Required)
- `POST /api/rooms` - Create room (Admin only)
- `PUT /api/rooms/:id` - Update room (Admin only)
- `DELETE /api/rooms/:id` - Delete room (Admin only)
- `PUT /api/rooms/:id/status` - Update room status (Admin only)
- `GET /api/rooms/stats` - Get room statistics (Admin only)

### Reservation Endpoints

#### All Endpoints Require Authentication
- `POST /api/reservations` - Create reservation
- `GET /api/reservations` - Get all reservations (Admin only)
- `GET /api/reservations/stats` - Get reservation statistics (Admin only)
- `GET /api/reservations/guest/:guestId` - Get reservations by guest
- `GET /api/reservations/:id` - Get reservation by ID
- `PUT /api/reservations/:id/cancel` - Cancel reservation
- `PUT /api/reservations/:id/status` - Update reservation status (Admin only)
- `PUT /api/reservations/:id/payment` - Update payment status (Admin only)
- `GET /api/reservations/rooms/availability` - Check room availability

## Business Logic

### Reservation Creation
1. Validate dates (check-in must be in future, check-out after check-in)
2. Verify room exists and is available
3. Check for overlapping reservations
4. Calculate total price (nights × price per night)
5. Create reservation and update room status to "reserved"
6. Use database transactions for data consistency

### Reservation Cancellation
1. Verify reservation exists and can be cancelled (24+ hours before check-in)
2. Update reservation status to "cancelled"
3. Free up the room (status = "available")
4. Record cancellation reason

### Room Availability Checking
1. Find rooms with overlapping reservations
2. Filter out unavailable rooms
3. Apply additional filters (room type, capacity, price range)
4. Return available rooms

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```javascript
{
  success: false,
  message: "Error description",
  errors: [] // Validation errors (if any)
}
```

## Validation Rules

### Reservation Creation
- Room ID must be valid MongoDB ObjectId
- Check-in date must be valid ISO 8601 date in future
- Check-out date must be after check-in date
- Adults count must be at least 1
- Children count cannot be negative
- Special requests limited to 500 characters

### Room Management
- Room number must be unique and 1-10 characters
- Room type must be Single, Double, or Suite
- Price per night must be positive number
- Capacity must be at least 1
- Description limited to 1000 characters

## Security Features

### Authentication
- JWT-based authentication for all reservation endpoints
- User context available in `req.user`

### Authorization
- Role-based access control (admin, employee, guest)
- Users can only access their own reservations
- Admin can access all reservations and manage rooms

### Data Validation
- Input validation using express-validator
- MongoDB ObjectId validation
- Date validation and business rule enforcement

## Testing

### Demo Data
Run `node create-demo-data.js` to create:
- 6 demo rooms (2 Single, 2 Double, 2 Suite)
- 3 demo reservations with different statuses
- Proper room status updates

### Test Suite
Run `node test-reservations.js` to test:
- Room CRUD operations
- Reservation creation and management
- Availability checking
- Business logic validation
- Statistics generation

## Usage Examples

### Create a Reservation
```javascript
POST /api/reservations
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "roomId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "checkIn": "2024-10-01T14:00:00.000Z",
  "checkOut": "2024-10-05T11:00:00.000Z",
  "guestCount": {
    "adults": 2,
    "children": 1
  },
  "specialRequests": "Late check-in requested"
}
```

### Check Room Availability
```javascript
GET /api/reservations/rooms/availability?checkIn=2024-10-01&checkOut=2024-10-05&roomType=Double&minCapacity=2
Authorization: Bearer <jwt_token>
```

### Get Room Statistics
```javascript
GET /api/rooms/stats
Authorization: Bearer <jwt_token>
```

## Database Transactions
Critical operations use MongoDB transactions to ensure data consistency:
- Reservation creation with room status update
- Reservation cancellation with room status update
- Status updates that affect multiple collections

## Performance Considerations
- Indexed fields for efficient queries
- Pagination support for large datasets
- Optimized aggregation pipelines for statistics
- Proper error handling to prevent crashes

## Future Enhancements
- Room inventory management
- Dynamic pricing based on demand
- Integration with payment gateways
- Email notifications for reservations
- Advanced reporting and analytics
- Multi-language support
- Mobile app API optimization
