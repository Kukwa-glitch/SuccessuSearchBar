// backend/src/controllers/documentController.js
const Document = require('../models/Document');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { emitToRole, emitToUser } = require('../socket');
const SOCKET_EVENTS = require('../socket/events');

/**
 * Create notification for all staff when admin adds document
 */
const createNotificationForStaff = async (document, sender, io) => {
  try {
    // Get all staff users
    const staffUsers = await User.find({ role: 'staff', isActive: true });

    if (staffUsers.length === 0) {
      console.log('No active staff users to notify');
      return [];
    }

    const notifications = staffUsers.map(staff => ({
      recipient: staff._id,
      sender: sender,
      type: 'DOCUMENT_ADDED',
      document: document._id,
      message: `New ${document.getTypeLabel()} added by admin for ${document.company}`,
      metadata: {
        documentType: document.type,
        company: document.company,
        documentNumber: document.documentNumber
      }
    }));

    // Create all notifications in database
    const createdNotifications = await Notification.insertMany(notifications);

    // Populate the notifications before emitting
    await Notification.populate(createdNotifications, [
      { path: 'sender', select: 'name username role' },
      { path: 'document', select: 'type company documentNumber documentDate' }
    ]);

    // Emit socket event to each staff member
    if (io) {
      createdNotifications.forEach(notification => {
        // Emit to individual user room
        emitToUser(
          io, 
          notification.recipient.toString(), 
          SOCKET_EVENTS.NEW_NOTIFICATION, 
          {
            notification,
            message: `New document added: ${document.company} - ${document.getTypeLabel()}`
          }
        );
      });

      // Also emit to all staff role room
      emitToRole(io, 'staff', SOCKET_EVENTS.DOCUMENT_ADDED, {
        document,
        message: `Admin added a new ${document.getTypeLabel()} for ${document.company}`
      });
    }

    console.log(`✅ Sent ${createdNotifications.length} notifications to staff members`);
    return createdNotifications;
  } catch (error) {
    console.error('Error creating notifications:', error);
    return [];
  }
};

/**
 * @desc    Search and filter documents
 * @route   GET /api/documents/search
 * @access  Private
 */
exports.searchDocuments = async (req, res) => {
  try {
    const { 
      search, 
      type, 
      startDate, 
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (type && type !== 'ALL') {
      query.type = type;
    }

    if (startDate || endDate) {
      query.documentDate = {};
      if (startDate) {
        query.documentDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.documentDate.$lte = end;
      }
    }

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      const isNumber = !isNaN(searchTerm);
      
      if (isNumber) {
        query.documentNumber = parseInt(searchTerm);
      } else {
        query.company = { $regex: searchTerm, $options: 'i' };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [documents, total] = await Promise.all([
      Document.find(query)
        .sort({ documentDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'name username role')
        .populate('updatedBy', 'name username role')
        .lean(),
      Document.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: documents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching documents',
      error: error.message
    });
  }
};

/**
 * @desc    Get all documents
 * @route   GET /api/documents
 * @access  Private
 */
exports.getAllDocuments = async (req, res) => {
  try {
    const { type } = req.query;
    const query = type && type !== 'ALL' ? { type } : {};

    const documents = await Document.find(query)
      .sort({ documentDate: -1 })
      .populate('createdBy', 'name username role')
      .populate('updatedBy', 'name username role');

    res.json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: error.message
    });
  }
};

/**
 * @desc    Get document by ID
 * @route   GET /api/documents/:id
 * @access  Private
 */
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('createdBy', 'name username role')
      .populate('updatedBy', 'name username role');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching document',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new document
 * @route   POST /api/documents
 * @access  Private/Admin
 */
exports.createDocument = async (req, res) => {
  try {
    const { type, company, documentNumber, documentDate } = req.body;

    // Upload image if provided
    let imageData = null;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'documents');
      imageData = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      };
    }

    const document = await Document.create({
      type,
      company,
      documentNumber,
      documentDate,
      image: imageData,
      createdBy: req.user.id
    });

    // Populate the created document
    await document.populate('createdBy', 'name username role');

    // Get Socket.IO instance and create notifications for staff
    const io = req.app.get('io');
    await createNotificationForStaff(document, req.user.id, io);

    res.status(201).json({
      success: true,
      message: 'Document created successfully and staff notified',
      data: document
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Document number already exists for this type'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating document',
      error: error.message
    });
  }
};

/**
 * @desc    Update document
 * @route   PUT /api/documents/:id
 * @access  Private/Admin
 */
exports.updateDocument = async (req, res) => {
  try {
    const { company, documentNumber, documentDate } = req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Handle image upload if new file provided
    if (req.file) {
      // Delete old image if exists
      if (document.image && document.image.publicId) {
        await deleteFromCloudinary(document.image.publicId);
      }

      // Upload new image
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'documents');
      document.image = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      };
    }

    // Update fields
    if (company) document.company = company;
    if (documentNumber) document.documentNumber = documentNumber;
    if (documentDate) document.documentDate = documentDate;
    document.updatedBy = req.user.id;

    await document.save();
    await document.populate('createdBy updatedBy', 'name username role');

    // Emit socket event for document update
    const io = req.app.get('io');
    if (io) {
      emitToRole(io, 'staff', SOCKET_EVENTS.DOCUMENT_UPDATED, {
        document,
        message: `Document updated: ${document.company} - ${document.getTypeLabel()}`
      });
    }

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating document',
      error: error.message
    });
  }
};

/**
 * @desc    Delete document
 * @route   DELETE /api/documents/:id
 * @access  Private/Admin
 */
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Store document info before deletion
    const documentInfo = {
      type: document.type,
      company: document.company,
      documentNumber: document.documentNumber
    };

    // Delete image from Cloudinary if exists
    if (document.image && document.image.publicId) {
      await deleteFromCloudinary(document.image.publicId);
    }

    await document.deleteOne();

    // Emit socket event for document deletion
    const io = req.app.get('io');
    if (io) {
      emitToRole(io, 'staff', SOCKET_EVENTS.DOCUMENT_DELETED, {
        documentInfo,
        message: `Document deleted: ${documentInfo.company} - ${document.getTypeLabel()}`
      });
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message
    });
  }
};