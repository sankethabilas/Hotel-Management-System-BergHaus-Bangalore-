const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const staffRoutes = require("./routes/staff");
const leaveRoutes = require("./routes/leaves");
const attendanceRoutes = require("./routes/attendanceRoute");
const paymentRoutes = require("./routes/paymentRoute");
const authRoutes = require("./routes/auth");
const frontdeskRoutes = require("./routes/frontdesk");
const bookingRoutes = require("./routes/booking");
const reservationRoutes = require("./routes/reservations");
const roomRoutes = require("./routes/rooms");
const billRoutes = require("./routes/bills");
const adminRoutes = require("./routes/adminRoutes");
const feedbackRoutes = require("./routes/feedback");
const contactRoutes = require("./routes/contact");
const inventoryRoutes = require("./routes/inventoryRoutes");
const staffRequestRoutes = require("./routes/staffRequestRoutes");
const crmReportsRoutes = require("./routes/crmReports");
const crmReportsTestRoutes = require("./routes/crmReportsTest");

const app = express();

//middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Frontend URLs
  credentials: true
}));
app.use(express.json());

app.use("/api/staff", staffRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/frontdesk", frontdeskRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/staff-requests", staffRequestRoutes);
app.use("/api/crm-reports", crmReportsRoutes);
app.use("/api/crm-test", crmReportsTestRoutes); // Test routes without auth
// Temporarily disabled: app.use("/api/attendance", attendanceRoutes);


//database connect
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('❌ MONGODB_URI environment variable is not defined. Please check your .env file.');
  process.exit(1);
}

// Don't log the full connection string for security
const maskedURI = mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
console.log('🔗 Connecting to MongoDB:', maskedURI);

mongoose.connect(mongoURI)
.then(()=> console.log("✅ Connected to MongoDB"))
.then(()=> {
    app.listen(5000, () => {
        console.log("Server running on port 5000");
    });
})

.catch((err)=> console.log("Database connection error:", err));



