import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import fileService from '../../services/fileService';
import authService from '../../services/authService';
import { setCredentials } from '../../store/authSlice';

// Assuming you have a user selector in your Redux store
const selectUser = (state: any) => state.auth.user;
const selectToken = (state: any) => state.auth.token;

const UserProfile: React.FC = () => {
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const dispatch = useDispatch();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      if (user.profileImageUrl) {
        setImagePreview(user.profileImageUrl);
      }
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create a preview of the image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!profileImage) return;
    
    setUploadLoading(true);
    setError(null);
    
    try {
      const result = await fileService.uploadFile(profileImage, 'profile');
      
      // Update user in Redux store
      if (result.profileImageUrl) {
        dispatch(setCredentials({
          user: {
            ...user,
            profileImageUrl: result.profileImageUrl
          },
          token: token
        }));
        
        setSuccess('Profile image updated successfully');
      }
    } catch (err: any) {
      console.error('Error uploading profile image:', err);
      setError(err.message || 'Failed to upload profile image');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Call API to update user profile
      const updatedUser = await authService.updateProfile({
        name,
        email
      });
      
      dispatch(setCredentials({
        user: updatedUser,
        token: token
      }));
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-4 rounded mb-4">{success}</div>}
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-6 md:mb-0">
            <div className="flex flex-col items-center">
              <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 mb-4">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              
              <input
                type="file"
                id="profileImage"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <label 
                htmlFor="profileImage"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded cursor-pointer hover:bg-gray-300 mb-2"
              >
                Select Image
              </label>
              
              {profileImage && (
                <button
                  onClick={handleUploadImage}
                  disabled={uploadLoading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {uploadLoading ? 'Uploading...' : 'Upload Image'}
                </button>
              )}
            </div>
          </div>
          
          <div className="md:w-2/3 md:pl-6">
            <form onSubmit={handleUpdateProfile}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
