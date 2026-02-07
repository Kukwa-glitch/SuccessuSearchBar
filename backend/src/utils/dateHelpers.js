// backend/src/utils/dateHelpers.js
/**
 * Date utility functions
 */

/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get start of day
 */
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day
 */
const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get date range
 */
const getDateRange = (startDate, endDate) => {
  const range = {};
  
  if (startDate) {
    range.$gte = getStartOfDay(startDate);
  }
  
  if (endDate) {
    range.$lte = getEndOfDay(endDate);
  }
  
  return Object.keys(range).length > 0 ? range : null;
};

module.exports = {
  formatDate,
  getStartOfDay,
  getEndOfDay,
  getDateRange
};