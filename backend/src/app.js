const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const {errorHandler, notFound} = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const salesInvoiceRoutes = require('./routes/salesInvoiceRoutes');
const deliveryReceiptRoutes = require('./routes/deliveryReceiptRoutes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['*']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health Check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running smoothly',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/sales-invoices', salesInvoiceRoutes);
app.use('/api/delivery-receipts', deliveryReceiptRoutes);

// 404 handler
app.use(notFound);

// Error Handler
app.use(errorHandler);

module.exports = app;