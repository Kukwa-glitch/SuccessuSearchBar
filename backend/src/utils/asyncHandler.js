// backend/src/utils/asyncHandler.js
/**
 * Async handler to wrap async route handlers
 * Eliminates need for try-catch in every route
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;