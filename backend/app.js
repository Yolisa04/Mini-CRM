const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling (must be last)
app.use(errorHandler);

module.exports = app;

