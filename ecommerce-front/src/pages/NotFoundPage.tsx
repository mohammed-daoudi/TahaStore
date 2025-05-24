import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-blue-900">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h2>
        <p className="mt-2 text-base text-gray-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;