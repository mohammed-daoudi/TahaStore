import { Link } from 'react-router-dom';
import { Settings, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

function AdminBanner() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  if (user?.role !== 'admin' || !isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          <span className="font-medium">
            Welcome, Admin! You have access to the admin dashboard.
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/admin"
            className="bg-white text-red-600 px-4 py-1 rounded-md text-sm font-medium hover:bg-gray-100 transition"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminBanner; 