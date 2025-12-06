const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

// Connect DB
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/logs', require('./routes/logs'));

app.get('/', (req, res) => res.send('CS Portal API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});