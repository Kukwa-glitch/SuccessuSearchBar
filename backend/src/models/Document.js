// backend/src/models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Document type is required'],
    enum: {
      values: ['PURCHASE_ORDER', 'SALES_INVOICE', 'DELIVERY_RECEIPT'],
      message: '{VALUE} is not a valid document type'
    },
    index: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    uppercase: true
  },
  documentNumber: {
    type: Number,
    required: [true, 'Document number is required']
  },
  documentDate: {
    type: Date,
    required: [true, 'Document date is required']
  },
  image: {
    url: String,
    publicId: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound unique index
documentSchema.index({ type: 1, documentNumber: 1 }, { unique: true });
documentSchema.index({ type: 1, company: 1, documentDate: -1 });
documentSchema.index({ type: 1, documentDate: -1 });
documentSchema.index({ createdBy: 1, createdAt: -1 });
documentSchema.index({ company: 1, documentDate: -1 });

// Helper method to get type label
documentSchema.methods.getTypeLabel = function() {
  const labels = {
    PURCHASE_ORDER: 'Purchase Order',
    SALES_INVOICE: 'Sales Invoice',
    DELIVERY_RECEIPT: 'Delivery Receipt'
  };
  return labels[this.type] || this.type;
};

module.exports = mongoose.model('Document', documentSchema);