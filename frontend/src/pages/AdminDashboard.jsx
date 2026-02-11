import React, { useState, useEffect } from 'react';
import { authAPI, documentAPI } from '../services/api';
import { formatDateInput, formatDate, getDocumentTypeLabel, getDocumentTypeBadgeColor, debounce } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  
  // Upload Document Form
  const [documentForm, setDocumentForm] = useState({
    type: '',
    company: '',
    documentNumber: '',
    documentDate: '',
    image: null,
  });
  const [uploading, setUploading] = useState(false);

  // Add User Form
  const [userForm, setUserForm] = useState({
    name: '',
    username: '',
    password: '',
  });
  const [adding, setAdding] = useState(false);

  // Documents by category
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [deliveryReceipts, setDeliveryReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search states for each tab
  const [searchPO, setSearchPO] = useState('');
  const [searchSI, setSearchSI] = useState('');
  const [searchDR, setSearchDR] = useState('');

  // Edit modal state
  const [editingDoc, setEditingDoc] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    company: '',
    documentNumber: '',
    documentDate: '',
    image: null,
  });

  useEffect(() => {
    if (activeTab === 'purchaseOrders') {
      fetchDocumentsByType('PURCHASE_ORDER', setPurchaseOrders, searchPO);
    } else if (activeTab === 'salesInvoices') {
      fetchDocumentsByType('SALES_INVOICE', setSalesInvoices, searchSI);
    } else if (activeTab === 'deliveryReceipts') {
      fetchDocumentsByType('DELIVERY_RECEIPT', setDeliveryReceipts, searchDR);
    }
  }, [activeTab]);

  const fetchDocumentsByType = async (type, setter, search = '') => {
    setLoading(true);
    try {
      const params = {
        type,
        search: search || undefined,
      };
      const response = await documentAPI.search(params);
      setter(response.data.data);
    } catch (error) {
      toast.error('Failed to load documents');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = debounce((type, value, setter, searchSetter) => {
    searchSetter(value);
    fetchDocumentsByType(type, setter, value);
  }, 500);

  const handleDocumentChange = (e) => {
    const { name, value } = e.target;
    setDocumentForm({
      ...documentForm,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setDocumentForm({
        ...documentForm,
        image: file,
      });
    }
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('type', documentForm.type);
      formData.append('company', documentForm.company.toUpperCase());
      formData.append('documentNumber', documentForm.documentNumber);
      formData.append('documentDate', documentForm.documentDate);
      if (documentForm.image) {
        formData.append('image', documentForm.image);
      }

      await documentAPI.create(formData);
      toast.success('Document uploaded successfully!');
      
      setDocumentForm({
        type: '',
        company: '',
        documentNumber: '',
        documentDate: '',
        image: null,
      });
      document.getElementById('document-image').value = '';

      // Refresh the appropriate tab's documents
      if (documentForm.type === 'PURCHASE_ORDER') {
        fetchDocumentsByType('PURCHASE_ORDER', setPurchaseOrders, searchPO);
      } else if (documentForm.type === 'SALES_INVOICE') {
        fetchDocumentsByType('SALES_INVOICE', setSalesInvoices, searchSI);
      } else if (documentForm.type === 'DELIVERY_RECEIPT') {
        fetchDocumentsByType('DELIVERY_RECEIPT', setDeliveryReceipts, searchDR);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload document';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm({
      ...userForm,
      [name]: value,
    });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);

    try {
      await authAPI.register(userForm);
      toast.success('User added successfully!');
      
      setUserForm({
        name: '',
        username: '',
        password: '',
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add user';
      toast.error(message);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteDocument = async (id, type) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentAPI.delete(id);
      toast.success('Document deleted successfully!');
      
      // Refresh the appropriate tab
      if (type === 'PURCHASE_ORDER') {
        fetchDocumentsByType('PURCHASE_ORDER', setPurchaseOrders, searchPO);
      } else if (type === 'SALES_INVOICE') {
        fetchDocumentsByType('SALES_INVOICE', setSalesInvoices, searchSI);
      } else if (type === 'DELIVERY_RECEIPT') {
        fetchDocumentsByType('DELIVERY_RECEIPT', setDeliveryReceipts, searchDR);
      }
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleEditClick = (doc) => {
    setEditingDoc(doc);
    setEditForm({
      company: doc.company,
      documentNumber: doc.documentNumber,
      documentDate: formatDateInput(doc.documentDate),
      image: null,
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value,
    });
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setEditForm({
        ...editForm,
        image: file,
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('company', editForm.company.toUpperCase());
      formData.append('documentNumber', editForm.documentNumber);
      formData.append('documentDate', editForm.documentDate);
      if (editForm.image) {
        formData.append('image', editForm.image);
      }

      await documentAPI.update(editingDoc._id, formData);
      toast.success('Document updated successfully!');
      setShowEditModal(false);

      // Refresh the appropriate tab
      if (editingDoc.type === 'PURCHASE_ORDER') {
        fetchDocumentsByType('PURCHASE_ORDER', setPurchaseOrders, searchPO);
      } else if (editingDoc.type === 'SALES_INVOICE') {
        fetchDocumentsByType('SALES_INVOICE', setSalesInvoices, searchSI);
      } else if (editingDoc.type === 'DELIVERY_RECEIPT') {
        fetchDocumentsByType('DELIVERY_RECEIPT', setDeliveryReceipts, searchDR);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update document';
      toast.error(message);
    }
  };

  const renderDocumentList = (documents, title, type, searchValue, setSearchValue) => (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30">
          <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{documents.length} documents</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            handleSearchChange(type, e.target.value, 
              type === 'PURCHASE_ORDER' ? setPurchaseOrders : 
              type === 'SALES_INVOICE' ? setSalesInvoices : 
              setDeliveryReceipts,
              setSearchValue
            );
          }}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Search by company or document number..."
        />
        <svg
          className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      ) : documents.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getDocumentTypeBadgeColor(doc.type)}`}>
                    #{doc.documentNumber}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(doc.documentDate)}
                  </span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">{doc.company}</p>
              </div>
              <div className="flex items-center gap-2">
                {doc.image?.url && (
                  <a
                    href={doc.image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    title="View document"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </a>
                )}
                <button
                  onClick={() => handleEditClick(doc)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Edit document"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteDocument(doc._id, doc.type)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete document"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">No documents found</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage documents and users</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'upload'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          📤 Upload Document
        </button>
        <button
          onClick={() => setActiveTab('purchaseOrders')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'purchaseOrders'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          📋 Purchase Orders
        </button>
        <button
          onClick={() => setActiveTab('salesInvoices')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'salesInvoices'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          💰 Sales Invoices
        </button>
        <button
          onClick={() => setActiveTab('deliveryReceipts')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'deliveryReceipts'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          🚚 Delivery Receipts
        </button>
        <button
          onClick={() => setActiveTab('addUser')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'addUser'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          👤 Add User
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Document Card */}
        {activeTab === 'upload' && (
          <div className="card p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upload Document</h3>
            </div>

            <form onSubmit={handleDocumentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Type *
                </label>
                <select
                  name="type"
                  value={documentForm.type}
                  onChange={handleDocumentChange}
                  required
                  className="input-field"
                >
                  <option value="">Select type</option>
                  <option value="PURCHASE_ORDER">Purchase Order</option>
                  <option value="SALES_INVOICE">Sales Invoice</option>
                  <option value="DELIVERY_RECEIPT">Delivery Receipt</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company"
                  value={documentForm.company}
                  onChange={handleDocumentChange}
                  required
                  className="input-field"
                  placeholder="Enter company name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Document Number *
                  </label>
                  <input
                    type="number"
                    name="documentNumber"
                    value={documentForm.documentNumber}
                    onChange={handleDocumentChange}
                    required
                    min="1"
                    className="input-field"
                    placeholder="123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Document Date *
                  </label>
                  <input
                    type="date"
                    name="documentDate"
                    value={documentForm.documentDate}
                    onChange={handleDocumentChange}
                    required
                    max={formatDateInput(new Date().toISOString())}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Image (Optional)
                </label>
                <input
                  type="file"
                  id="document-image"
                  accept="image/*,.pdf"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-400"
                />
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 5MB</p>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Document
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Purchase Orders Tab */}
        {activeTab === 'purchaseOrders' && renderDocumentList(purchaseOrders, 'Purchase Orders', 'PURCHASE_ORDER', searchPO, setSearchPO)}

        {/* Sales Invoices Tab */}
        {activeTab === 'salesInvoices' && renderDocumentList(salesInvoices, 'Sales Invoices', 'SALES_INVOICE', searchSI, setSearchSI)}

        {/* Delivery Receipts Tab */}
        {activeTab === 'deliveryReceipts' && renderDocumentList(deliveryReceipts, 'Delivery Receipts', 'DELIVERY_RECEIPT', searchDR, setSearchDR)}

        {/* Add User Card */}
        {activeTab === 'addUser' && (
          <div className="card p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add User</h3>
            </div>

            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={userForm.name}
                  onChange={handleUserChange}
                  required
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={userForm.username}
                  onChange={handleUserChange}
                  required
                  minLength="3"
                  className="input-field"
                  placeholder="johndoe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={userForm.password}
                  onChange={handleUserChange}
                  required
                  minLength="6"
                  className="input-field"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {adding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding User...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Add User
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="card p-6 w-full max-w-md animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Document</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={editForm.company}
                    onChange={handleEditFormChange}
                    required
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Document Number *
                    </label>
                    <input
                      type="number"
                      name="documentNumber"
                      value={editForm.documentNumber}
                      onChange={handleEditFormChange}
                      required
                      min="1"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Document Date *
                    </label>
                    <input
                      type="date"
                      name="documentDate"
                      value={editForm.documentDate}
                      onChange={handleEditFormChange}
                      required
                      max={formatDateInput(new Date().toISOString())}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Update Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleEditImageChange}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;