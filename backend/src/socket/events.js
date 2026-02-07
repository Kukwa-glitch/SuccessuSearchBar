// backend/src/socket/events.js
/**
 * Socket event constants
 */
const SOCKET_EVENTS = {
  // Notification events
  NEW_NOTIFICATION: 'new_notification',
  NOTIFICATION_RECEIVED: 'notification_received',
  NOTIFICATION_READ: 'notification_read',
  
  // Document events
  DOCUMENT_ADDED: 'document_added',
  DOCUMENT_UPDATED: 'document_updated',
  DOCUMENT_DELETED: 'document_deleted',
  
  // User events
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  
  // Room events
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error'
};

module.exports = SOCKET_EVENTS;