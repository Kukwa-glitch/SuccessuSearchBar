// backend/server.js
require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { initializeSocket } = require('./src/socket');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Store io instance in app for use in routes
app.set('io', io);

// Start the server
server.listen(PORT, () => {
  logger.info(`╔═══════════════════════════════════════════════╗`);
  logger.info(`║                                               ║`);
  logger.info(`║   📦 Stock Inventory Management System        ║`);
  logger.info(`║                                               ║`);
  logger.info(`║   🚀 Server: http://localhost:${PORT}          ║`);
  logger.info(`║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                    ║`);
  logger.info(`║   📊 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}                       ║`);
  logger.info(`║   🔌 Socket.IO: Active                         ║`);
  logger.info(`║                                               ║`);
  logger.info(`╚═══════════════════════════════════════════════╝`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown on SIGTERM
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    logger.info('✅ Process terminated gracefully');
    process.exit(0);
  });
});