import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { favoriteService } from '../services/favoriteService';
import { productService } from '../services/productService';
import ProductCard from '../components/products/ProductCard';
import toast from 'react-hot-toast';

function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const userFavorites = await favoriteService.getUserFavorites(user.id);
        
        // Get full product details for each favorite
        const favoriteProducts = await Promise.all(
          userFavorites.map(async (favorite) => {
            try {
              const product = await productService.getProductById(favorite.productId);
              return product;
            } catch (error) {
              console.error(`Failed to fetch product ${favorite.productId}:`, error);
              return null;
            }
          })
        );

        setFavorites(favoriteProducts.filter(Boolean));
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
        toast.error('Failed to load favorites');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please login to view your favorites</h2>
          <Link to="/login">
            <Button variant="primary">Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Favorites</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Favorites</h1>
      
      {favorites.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
            <Heart className="h-full w-full" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">No favorites yet</h2>
          <p className="text-gray-500 mb-6">
            Save your favorite products here for quick access later.
          </p>
          <Link to="/products">
            <Button variant="primary">
              Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              isFavorited={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage; 