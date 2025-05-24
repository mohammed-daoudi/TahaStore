import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // In a real app, we would update the user profile here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="bg-blue-900 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">My Account</h1>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            {!isEditing && (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 mb-6">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                
                <hr className="my-6" />
                
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-500 mb-4">Leave blank if you don't want to change your password</p>
                
                <Input
                  label="Current Password"
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
                
                <Input
                  label="New Password"
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
                
                <Input
                  label="Confirm New Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  isLoading={isSaving}
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <dl className="divide-y divide-gray-200">
                <div className="py-3 grid grid-cols-3">
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{user?.name}</dd>
                </div>
                <div className="py-3 grid grid-cols-3">
                  <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{user?.email}</dd>
                </div>
                <div className="py-3 grid grid-cols-3">
                  <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                  <dd className="text-sm text-gray-900 col-span-2">January 1, 2025</dd>
                </div>
              </dl>
            </div>
          )}
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Options</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/orders')}
              >
                View Order History
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;