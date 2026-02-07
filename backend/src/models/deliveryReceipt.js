const mongoose = require('mongoose');

const deliveryReceiptSchema = new mongoose.Schema({
    company: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        uppercase: true
    },
    purchaseOrderNumber: {
        type: Number,
        required: [true, 'Purchase order number is required'],
        unique: true
    },
    purchaseOrderDate: {
        type: Date,
        required: [true, 'Purchase order date is required']
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

// Indexes for faster queries
deliveryReceiptSchema.index({ company: 1, purchaseOrderDate: -1 });
deliveryReceiptSchema.index({ purchaseOrderNumber: 1 });
deliveryReceiptSchema.index({ createdBy: 1, createdAt: -1 });
deliveryReceiptSchema.index({ purchaseOrderDate: -1 });

// Method to get formatted purchase order
deliveryReceiptSchema.methods.getFormatted = function() {
  return {
    id: this._id,
    company: this.company,
    poNumber: this.purchaseOrderNumber,
    poDate: this.purchaseOrderDate,
    image: this.image,
    createdBy: this.createdBy,
    updatedBy: this.updatedBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Method to check if PO is editable (example: within 30 days)
deliveryReceiptSchema.methods.isEditable = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.purchaseOrderDate >= thirtyDaysAgo;
};

// Static method to find POs by company
deliveryReceiptSchema.statics.findByCompany = function(companyName) {
  return this.find({ company: companyName.toUpperCase() })
    .sort({ purchaseOrderDate: -1 });
};

module.exports = mongoose.model('DeliveryReceipt', deliveryReceiptSchema);