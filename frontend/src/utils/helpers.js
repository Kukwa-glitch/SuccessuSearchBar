import { format, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  try {
    return format(parseISO(date), 'MMM dd, yyyy');
  } catch (error) {
    return '';
  }
};

export const formatDateTime = (date) => {
  if (!date) return '';
  try {
    return format(parseISO(date), 'MMM dd, yyyy hh:mm a');
  } catch (error) {
    return '';
  }
};

export const formatDateInput = (date) => {
  if (!date) return '';
  try {
    return format(parseISO(date), 'yyyy-MM-dd');
  } catch (error) {
    return '';
  }
};

export const getDocumentTypeLabel = (type) => {
  const labels = {
    PURCHASE_ORDER: 'Purchase Order',
    SALES_INVOICE: 'Sales Invoice',
    DELIVERY_RECEIPT: 'Delivery Receipt',
  };
  return labels[type] || type;
};

export const getDocumentTypeBadgeColor = (type) => {
  const colors = {
    PURCHASE_ORDER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    SALES_INVOICE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    DELIVERY_RECEIPT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};