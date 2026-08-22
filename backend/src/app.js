require('dotenv').config();
const express = require('express');
const cors = require('cors');
const healthRouter = require('./routes/health');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const authRouter = require('./routes/auth.routes');
const tripRouter = require('./routes/trip.routes');
const recommendationRouter = require('./routes/recommendation.routes');
const itineraryRouter = require('./routes/itinerary.routes');
const expenseRouter = require('./routes/expense.routes');
const shareRouter = require('./routes/share.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with customizable origin
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Built-in JSON request parser middleware
app.use(express.json());

// Main application API routes
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/trips', tripRouter);
app.use('/api/destinations', recommendationRouter);
app.use('/api', shareRouter);
app.use('/api/trips', itineraryRouter);
app.use('/api/trips', expenseRouter);

// Central 404 handler for unmatched routes
app.use(notFoundHandler);

// Centralized error handler
app.use(globalErrorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 GlobeTrotter Backend listening on port ${PORT}`);
  console.log(`🌍 Health endpoint: http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);
});

module.exports = app;
