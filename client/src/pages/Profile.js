import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Building2, Calendar, ArrowLeft, Edit2, Phone, Users as UsersIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EditProfileModal from '../components/EditProfileModal';
import toast from 'react-hot-toast';
import axios from 'axios';

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // FETCH LATEST PROFILE DATA FROM BACKEND - wrapped in useCallback
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get('https://rizeos-api.onrender.com/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const freshUserData = response.data;
      console.log('Fetched fresh user data:', freshUserData);
      
      setUserData(freshUserData);
      
      // Update localStorage with fresh data
      localStorage.setItem('user', JSON.stringify(freshUserData));
      
      // Update AuthContext if setUser exists
      if (setUser) {
        setUser(freshUserData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [setUser]); // Added setUser as dependency

  // Load data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]); // Added fetchUserProfile as dependency

  // Also update when user context changes
  useEffect(() => {
    if (user && user.email && !userData) {
      setUserData(user);
    }
  }, [user, userData]); // Added userData as dependency

  const handleProfileUpdate = (updatedUser) => {
    setUserData(updatedUser);
    if (setUser) {
      setUser(updatedUser);
    }
    localStorage.setItem('user', JSON.stringify(updatedUser));
    toast.success('Profile updated successfully');
    // Refresh data from backend to ensure sync
    fetchUserProfile();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading profile...</p>
      </div>
    );
  }

  // If no user data at all, show login prompt
  if (!userData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No user data found</h2>
        <p className="text-gray-500 mb-4">Please log in to view your profile</p>
        <button
          onClick={() => navigate('/login')}
          className="btn-primary"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-primary-600" />
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{userData.companyName || 'Administrator'}</h1>
              <p className="text-primary-100">Account Administrator</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="text-primary-600 hover:text-primary-700 flex items-center text-sm font-medium"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit Profile
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-500 mr-3" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="text-gray-900 font-medium">
                  {userData.email || 'Not available'}
                </p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Building2 className="w-5 h-5 text-gray-500 mr-3" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Company Name</p>
                <p className="text-gray-900 font-medium">
                  {userData.companyName || 'Not available'}
                </p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-500 mr-3" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="text-gray-900 font-medium">
                  {userData.phone || 'Not available'}
                </p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <UsersIcon className="w-5 h-5 text-gray-500 mr-3" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Company Size</p>
                <p className="text-gray-900 font-medium">
                  {userData.companySize || 'Not available'}
                </p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500 mr-3" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-gray-900 font-medium">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button 
                onClick={() => toast.info('Change password feature coming soon!')}
                className="text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
              >
                Change Password
              </button>
              <button 
                onClick={() => toast.info('Notification preferences coming soon!')}
                className="text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
              >
                Notification Preferences
              </button>
              <button 
                onClick={() => toast.info('Team settings coming soon!')}
                className="text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
              >
                Team Settings
              </button>
              <button 
                onClick={() => toast.info('Billing & plans coming soon!')}
                className="text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
              >
                Billing & Plans
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-700">
              <span className="font-semibold">Note:</span> Some settings are under development. 
              Check back soon for updates!
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={userData}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
};


export default Profile;
