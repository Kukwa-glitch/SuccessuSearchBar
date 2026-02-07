require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

//connect to the database
connectDB();

// start the server
const server = app.listen(PORT, () => {
  console.log(`╔═══════════════════════════════════════════════╗
║                                               ║
║   📦 Stock Inventory Management System        ║
║                                               ║
║   🚀 Server: http://localhost:${PORT}          ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                    ║
║   📊 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}                       ║
║                                               ║
╚═══════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

// Graceful shutdown on SIGTERM (e.g., Ctrl+C)
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Process terminated gracefully');
        process.exit(0);
    });
});