import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Settings } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import Button from '../components/ui/Button';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setIsLoading(true);
      try {
        const products = await productService.getFeaturedProducts();
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Quality Products for Every Lifestyle
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Discover a world of exceptional products curated just for you.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button size="lg">
                  Shop Now
                </Button>
              </Link>
              <Link to="/products?featured=true">
                <Button variant="outline" size="lg" className="bg-opacity-20 bg-white text-white border-white">
                  Explore Featured
                </Button>
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin">
                  <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Admin Dashboard Section */}
      {user?.role === 'admin' && (
        <section className="py-12 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Admin Dashboard
              </h2>
              <p className="text-gray-600">Manage your store, products, and customers</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'Products', route: '/admin/products', icon: '📦', description: 'Manage products' },
                { name: 'Orders', route: '/admin/orders', icon: '📋', description: 'View orders' },
                { name: 'Users', route: '/admin/users', icon: '👥', description: 'Manage users' },
                { name: 'Analytics', route: '/admin', icon: '📊', description: 'View analytics' },
              ].map((item, index) => (
                <Link 
                  to={item.route}
                  key={index}
                  className="group bg-white rounded-lg shadow-sm p-6 text-center transition hover:shadow-md hover:scale-105 border border-gray-200"
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Electronics', image: 'https://images.pexels.com/photos/325153/pexels-photo-325153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
              { name: 'Fashion', image: 'https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
              { name: 'Home & Kitchen', image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
              { name: 'Beauty', image: 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
            ].map((category, index) => (
              <Link 
                to={`/products?category=${category.name.toLowerCase()}`}
                key={index}
                className="group relative rounded-lg overflow-hidden bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="aspect-w-1 aspect-h-1 pb-[100%] relative overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg md:text-xl font-medium text-white">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
            <Link to="/products" className="text-blue-900 hover:text-blue-700 flex items-center font-medium">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                  <div className="bg-gray-300 h-48 w-full rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No featured products available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Using mock data until we connect to the backend */}
              {[
                { id: '1', name: 'Wireless Headphones', price: 99.99, image: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', description: 'Premium wireless headphones with noise cancellation.' },
                { id: '2', name: 'Smart Watch', price: 159.99, image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', description: 'Track your fitness and stay connected with this smartwatch.' },
                { id: '3', name: 'Desk Lamp', price: 49.99, image: 'https://images.pexels.com/photos/4050304/pexels-photo-4050304.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', description: 'Adjustable desk lamp with multiple brightness levels.' },
                { id: '4', name: 'Coffee Maker', price: 79.99, image: 'https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', description: 'Programmable coffee maker for your perfect morning brew.' },
              ].map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Special Offer</h2>
            <p className="text-xl mb-6">
              Get 20% off on your first purchase
            </p>
            <Link to="/products?discount=true">
              <Button variant="secondary" size="lg">
                Shop Discounted Items
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah Johnson',
                text: 'The quality of the products exceeded my expectations. Will definitely shop here again!',
                rating: 5,
              },
              {
                name: 'Michael Rodriguez',
                text: 'Fast shipping and great customer service. The product was exactly as described.',
                rating: 5,
              },
              {
                name: 'Emily Thompson',
                text: 'I love the variety of products available. Found exactly what I was looking for at a great price.',
                rating: 4,
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${
                        i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                <p className="font-medium text-gray-900">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;