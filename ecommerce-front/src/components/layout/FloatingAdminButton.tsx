import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function FloatingAdminButton() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        to="/admin"
        className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
        title="Admin Dashboard"
      >
        <Settings className="h-6 w-6" />
      </Link>
    </div>
  );
}

export default FloatingAdminButton; 