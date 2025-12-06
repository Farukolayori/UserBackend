// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(express.json());

// Allow your frontend to connect (change port if needed)
app.use(cors({
  origin: 'http://localhost:3000',  // React default port
  credentials: true
}));

// Your MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected (Atlas)'))
  .catch(err => console.log('MongoDB Error:', err));

// ... [All the routes from my previous message: /register, /login, /users, etc.]

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});