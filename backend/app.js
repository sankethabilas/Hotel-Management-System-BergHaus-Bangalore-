//pass - oUjfgXYl0PS0GhOg
//pass2 - VLjkNVWo2RgDIpGb
//link - mongodb+srv://admin:<db_password>@cluster0.oyfmect.mongodb.net/

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser'); 
const cors = require('cors');
const routes = require('./routes/itemroutes');
const staffRequestRoutes = require('./routes/staffRequestRoutes');

const app = express();

// middleware
app.use(cors());
app.use(bodyParser.json()); //this line should be before app.use(routes);
app.use(routes);
app.use(staffRequestRoutes);

// constants
const PORT = 8000;
const URL = 'mongodb+srv://Sanketh:Gv5T0YzYqgFCI6th@cluster0.6vyj3nr.mongodb.net/hms_database';

// connect DB
mongoose.connect(URL)
  .then(() => console.log(' Connected to MongoDB'))
  .catch(err => console.log(' Error connecting to MongoDB', err));

// start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

