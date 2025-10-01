const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const router = require("./routes/StaffRoute");
const leaveRoutes = require("./routes/leaveRoute");
const attendanceRoutes = require("./routes/attendanceRoute");
const paymentRoutes = require("./routes/paymentRoute");

const app = express();

//middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Frontend URLs
  credentials: true
}));
app.use(express.json());

app.use("/staff", router);
app.use("/leave", leaveRoutes);
app.use("/api/payments", paymentRoutes);
// Temporarily disabled: app.use("/api/attendance", attendanceRoutes);


//database connect
//KEaE9K4RSPu8dd1j
//mongoose.connect("mongodb+srv://admin:sIeTivhp0roOe0Bx@cluster0.qp4mpdo.mongodb.net/")
mongoose.connect("mongodb+srv://danidu:KEaE9K4RSPu8dd1j@cluster0.6vyj3nr.mongodb.net/hms_database")
.then(()=> console.log("connected to mongodb"))
.then(()=> {
    app.listen(5000, () => {
        console.log("Server running on port 5000");
    });
})

.catch((err)=> console.log("Database connection error:", err));



