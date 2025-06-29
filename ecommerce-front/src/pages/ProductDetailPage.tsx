import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import { favoriteService } from '../services/favoriteService';
import ProductCard from '../components/products/ProductCard';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import SocialShare from '../components/sharing/SocialShare';

function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      try {
        if (id) {
          const productData = await productService.getProductById(id);
          setProduct(productData);
          
          // Fetch related products
          const related = await productService.getRelatedProducts(id);
          setRelatedProducts(related);
          
          // Check if product is favorited
          if (user) {
            setIsCheckingFavorite(true);
            const favorited = await favoriteService.isProductFavorited(user.id, id);
            setIsFavorited(favorited);
          }
        }
      } catch (error) {
        console.error('Failed to fetch product details:', error);
        toast.error('Failed to load product details');
      } finally {
        setIsLoading(false);
        setIsCheckingFavorite(false);
      }
    };

    window.scrollTo(0, 0);
    fetchProductDetails();
  }, [id, user]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          name: product.name || product.nom,
          price: product.price || product.prix || 0,
          image: product.images[0],
        });
      }
      toast.success(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart`);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Please login to add favorites');
      return;
    }

    try {
      if (isFavorited) {
        await favoriteService.removeFromFavorites(user.id, product._id);
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await favoriteService.addToFavorites(user.id, product._id);
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update favorites');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-300 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/3"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              <div className="h-10 bg-gray-300 rounded w-1/2 mt-6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link to="/" className="hover:text-blue-900">Home</Link>
          </li>
          <li>
            <span>/</span>
          </li>
          <li>
            <Link to="/products" className="hover:text-blue-900">Products</Link>
          </li>
          <li>
            <span>/</span>
          </li>
          <li>
            <Link 
              to={`/products?category=${product.category?.toLowerCase()}`} 
              className="hover:text-blue-900"
            >
              {product.category}
            </Link>
          </li>
          <li>
            <span>/</span>
          </li>
          <li className="text-gray-700 font-medium truncate">{product.name || product.nom}</li>
        </ol>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Product Images */}
        <div>
          <div className="bg-white rounded-lg overflow-hidden mb-4">
            <img
              src={product.images && product.images[selectedImage] ? product.images[selectedImage] : '/placeholder-product.jpg'}
              alt={product.name || product.nom}
              className="w-full h-full object-contain aspect-square"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`bg-white rounded border overflow-hidden ${
                    selectedImage === index
                      ? 'border-blue-900 ring-2 ring-blue-900 ring-opacity-50'
                      : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name || product.nom} view ${index + 1}`}
                    className="w-full h-full object-cover aspect-square"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name || product.nom}</h1>
          
          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-gray-600">
              {product.rating || 0} ({product.reviewCount || 0} reviews)
            </span>
            <span className="mx-2 text-gray-300">|</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              (product.stock || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {(product.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          
          {/* Price */}
          <div className="text-2xl font-bold text-gray-900 mb-4">
            ${Number(product.price ?? product.prix ?? 0).toFixed(2)}
          </div>
          
          {/* Description */}
          <p className="text-gray-700 mb-6">{product.description}</p>
          
          {/* Add to Cart */}
          <div className="flex items-center mb-6">
            <div className="flex items-center border border-gray-300 rounded-md mr-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-12 border-0 text-center focus:ring-0"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
              >
                +
              </button>
            </div>
            <Button
              variant="primary"
              fullWidth
              onClick={handleAddToCart}
              disabled={!(product.stock || 0)}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
          
          {/* Additional Actions */}
          <div className="flex space-x-4 mb-6">
            <Button
              variant={isFavorited ? "primary" : "outline"}
              onClick={handleToggleFavorite}
              disabled={isCheckingFavorite}
            >
              <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Trigger the social share component
                const shareComponent = document.querySelector('[data-share-trigger]');
                if (shareComponent) {
                  shareComponent.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex items-center text-gray-600 hover:text-blue-900"
            >
              <Share2 className="h-5 w-5 mr-1" />
              <span className="text-sm">Share</span>
            </Button>
          </div>
          
          {/* Shipping & Returns */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <div className="flex items-start">
              <Truck className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Free Shipping</h4>
                <p className="text-sm text-gray-500">Free standard shipping on orders over $50</p>
              </div>
            </div>
            <div className="flex items-start">
              <RotateCcw className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Easy Returns</h4>
                <p className="text-sm text-gray-500">30-day hassle-free return policy</p>
              </div>
            </div>
            <div className="flex items-start">
              <ShieldCheck className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Satisfaction Guaranteed</h4>
                <p className="text-sm text-gray-500">Our products are backed by our 100% guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mb-16">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['Features', 'Specifications', 'Reviews'].map((tab, index) => (
              <button
                key={index}
                className={`
                  ${index === 0 ? 'border-blue-900 text-blue-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                `}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="py-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Features</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {product.features && product.features.map((feature: string, index: number) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Related Products */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {relatedProducts && relatedProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>

      {/* Social Share */}
      <div className="mt-8" data-share-trigger>
        <SocialShare
          url={window.location.href}
          title={product.name || product.nom}
          description={product.description}
          image={product.images && product.images[0] ? product.images[0] : undefined}
        />
      </div>
    </div>
  );
}

export default ProductDetailPage;