import React, { useState, useEffect } from 'react';
import { User, Bell, Lock, Globe, Palette, Mail, AlertCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import type { UserProfile } from '../types';
import { LoadingState, initialLoadingState, handleAsyncOperation } from '../types/loading';

interface SettingsFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
    jobAlerts: boolean;
  };
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

const Settings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [{ isLoading, error }, setLoadingState] = useState<LoadingState>(initialLoadingState);
  const [formData, setFormData] = useState<SettingsFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferences: {
      theme: 'system',
      emailNotifications: true,
      jobAlerts: true
    }
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar,
        preferences: user.preferences
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (formData.phone && !/^\+?[\d-\s()]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name.startsWith('preferences.')) {
      const prefName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefName]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    await handleAsyncOperation(
      async () => {
        // Replace with your actual update action
        const response = await fetch('/api/user/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to update settings');
        }

        setIsDirty(false);
      },
      (loading) => setLoadingState(prev => ({ ...prev, isLoading: loading })),
      (error) => setLoadingState(prev => ({ ...prev, error }))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <button
          onClick={handleSubmit}
          disabled={!isDirty || isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error.message}</span>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="p-6 space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h2>
            <div className="flex items-center">
              <img
                className="h-20 w-20 rounded-full"
                src={formData.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                alt="Profile"
              />
              <div className="ml-6">
                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  Change Photo
                </button>
                <p className="mt-2 text-sm text-gray-500">
                  JPG, GIF or PNG. Max size of 800K
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  validationErrors.firstName ? 'border-red-300' : 'border-gray-300'
                } focus:border-indigo-500 focus:ring-indigo-500`}
              />
              {validationErrors.firstName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  validationErrors.lastName ? 'border-red-300' : 'border-gray-300'
                } focus:border-indigo-500 focus:ring-indigo-500`}
              />
              {validationErrors.lastName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  validationErrors.email ? 'border-red-300' : 'border-gray-300'
                } focus:border-indigo-500 focus:ring-indigo-500`}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  validationErrors.phone ? 'border-red-300' : 'border-gray-300'
                } focus:border-indigo-500 focus:ring-indigo-500`}
              />
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-400" />
                <span className="ml-3 text-sm text-gray-700">Email Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="preferences.emailNotifications"
                  checked={formData.preferences.emailNotifications}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-gray-400" />
                <span className="ml-3 text-sm text-gray-700">Job Alert Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="preferences.jobAlerts"
                  checked={formData.preferences.jobAlerts}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Palette className="h-5 w-5 text-gray-400" />
                <span className="ml-3 text-sm text-gray-700">Dark Mode</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="preferences.theme"
                  checked={formData.preferences.theme === 'dark'}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Security</h2>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-gray-400" />
                <span className="ml-3 text-sm text-gray-700">Change Password</span>
              </div>
              <span className="text-sm text-gray-500">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;