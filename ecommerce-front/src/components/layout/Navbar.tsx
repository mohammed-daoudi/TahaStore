import { ShoppingCart, User, Heart } from 'lucide-react';

// Inside the navigation menu items
{user && (
  <Link
    to="/favorites"
    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
  >
    <Heart className="h-5 w-5 inline-block mr-1" />
    Favorites
  </Link>
)} 