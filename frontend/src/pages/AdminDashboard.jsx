import React, { useState } from 'react';
import { authAPI, documentAPI } from '../services/api';
import { formatDateInput } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'addUser'
  
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
      toast.success('Document uploaded successfully! Staff has been notified.');
      
      // Reset form
      setDocumentForm({
        type: '',
        company: '',
        documentNumber: '',
        documentDate: '',
        image: null,
      });
      // Reset file input
      document.getElementById('document-image').value = '';
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
      
      // Reset form
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage documents and users</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'upload'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Upload Document
        </button>
        <button
          onClick={() => setActiveTab('addUser')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'addUser'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Add User
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
    </div>
  );
};

export default AdminDashboard;