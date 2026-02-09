import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SSI from '../assets/SSI.png';

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(formData);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          {/* Logo placeholder - you can add your logo image here */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-md">
            <img src={SSI} alt="Logo" className="w-16 h-16" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            SUCCESSU INTERNATIONAL INC.
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Document Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-lg transform transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Demo Credentials:</p>
          <p className="mt-1">Admin: admin/admin123</p>
          <p>Staff: staff/staff123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;