// backend/src/socket/index.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Initialize Socket.IO
 */
const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      if (!user.isActive) {
        return next(new Error('Authentication error: User account is disabled'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.username} (${socket.id})`);

    // Join user to their own room for notifications
    const userRoom = `user_${socket.user.id}`;
    socket.join(userRoom);
    console.log(`👤 ${socket.user.username} joined room: ${userRoom}`);

    // Join role-based room
    const roleRoom = `role_${socket.user.role}`;
    socket.join(roleRoom);
    console.log(`👥 ${socket.user.username} joined room: ${roleRoom}`);

    // Handle client joining specific rooms
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`📥 ${socket.user.username} joined custom room: ${room}`);
    });

    // Handle client leaving specific rooms
    socket.on('leave_room', (room) => {
      socket.leave(room);
      console.log(`📤 ${socket.user.username} left custom room: ${room}`);
    });

    // Handle notification acknowledgment
    socket.on('notification_received', (data) => {
      console.log(`📬 ${socket.user.username} acknowledged notification:`, data.notificationId);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.username} (${socket.id})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`⚠️  Socket error for ${socket.user.username}:`, error);
    });
  });

  return io;
};

/**
 * Emit notification to specific user
 */
const emitToUser = (io, userId, event, data) => {
  io.to(`user_${userId}`).emit(event, data);
};

/**
 * Emit notification to all users with specific role
 */
const emitToRole = (io, role, event, data) => {
  io.to(`role_${role}`).emit(event, data);
};

/**
 * Emit notification to all connected users
 */
const emitToAll = (io, event, data) => {
  io.emit(event, data);
};

module.exports = {
  initializeSocket,
  emitToUser,
  emitToRole,
  emitToAll
};