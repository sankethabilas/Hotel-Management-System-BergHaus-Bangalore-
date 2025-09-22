const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const router = require("./Route/StaffRoute");
const leaveRoutes = require("./Route/leaveRoute");

const app = express();

//middleware
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true
}));
app.use(express.json());

app.use("/staff", router);
app.use("/leave", leaveRoutes);


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



