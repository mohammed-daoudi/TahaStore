import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, X } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { productService } from '../services/productService';

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const initialSearchQuery = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // In a real application, we would pass all filters to the API
        const queryParams = Object.fromEntries(searchParams);
        const products = await productService.getProducts(queryParams);
        setProducts(products);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      searchParams.set('search', searchQuery);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      } else {
        searchParams.delete(key);
      }
    });
    
    setSearchParams(searchParams);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
    });
    
    setSearchQuery('');
    setSearchParams({});
  };
  
  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {searchParams.get('category') 
          ? `${searchParams.get('category')} Products` 
          : 'All Products'}
      </h1>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        {/* Search */}
        <div className="md:max-w-md w-full">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Search size={18} />
              </div>
              <Button 
                type="submit" 
                className="absolute right-1 top-1"
                size="sm"
                variant="outline"
              >
                Search
              </Button>
            </div>
          </form>
        </div>

        {/* Filter Button (Mobile) */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={toggleFilters}
            className="md:hidden flex items-center"
          >
            <Filter size={16} className="mr-2" />
            Filters
          </Button>

          {/* Sort (Desktop) */}
          <div className="hidden md:block">
            <select
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applied Filters */}
      {(searchParams.size > 0) && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 mr-2">Applied filters:</span>
          
          {searchParams.get('search') && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              Search: {searchParams.get('search')}
              <button 
                onClick={() => {
                  searchParams.delete('search');
                  setSearchQuery('');
                  setSearchParams(searchParams);
                }}
                className="ml-1 inline-flex items-center"
              >
                <X size={12} />
              </button>
            </span>
          )}
          
          {searchParams.get('category') && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              Category: {searchParams.get('category')}
              <button 
                onClick={() => {
                  searchParams.delete('category');
                  setFilters(prev => ({ ...prev, category: '' }));
                  setSearchParams(searchParams);
                }}
                className="ml-1 inline-flex items-center"
              >
                <X size={12} />
              </button>
            </span>
          )}
          
          {(searchParams.get('minPrice') || searchParams.get('maxPrice')) && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              Price: {searchParams.get('minPrice') || '0'} - {searchParams.get('maxPrice') || '∞'}
              <button 
                onClick={() => {
                  searchParams.delete('minPrice');
                  searchParams.delete('maxPrice');
                  setFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' }));
                  setSearchParams(searchParams);
                }}
                className="ml-1 inline-flex items-center"
              >
                <X size={12} />
              </button>
            </span>
          )}
          
          <button 
            onClick={resetFilters}
            className="text-sm text-red-600 hover:text-red-800 ml-auto"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Filters (Mobile) */}
      {isFilterOpen && (
        <div className="md:hidden bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Filters</h3>
            <button onClick={toggleFilters}>
              <X size={18} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home">Home & Kitchen</option>
                <option value="beauty">Beauty</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <span>-</span>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                fullWidth
                onClick={resetFilters}
              >
                Reset
              </Button>
              <Button
                fullWidth
                onClick={applyFilters}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters (Desktop) */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-medium text-lg mb-4">Filters</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Category</h4>
                <div className="space-y-2">
                  {['All Categories', 'Electronics', 'Fashion', 'Home & Kitchen', 'Beauty'].map((category, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="radio"
                        id={`category-${index}`}
                        name="category"
                        value={index === 0 ? '' : category.toLowerCase()}
                        checked={index === 0 ? filters.category === '' : filters.category === category.toLowerCase()}
                        onChange={handleFilterChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`category-${index}`} className="ml-2 text-sm text-gray-700">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Price Range</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border border-gray-300 py-1.5 px-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border border-gray-300 py-1.5 px-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mb-2"
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={applyFilters}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                  <div className="bg-gray-300 h-48 w-full rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No products found matching your criteria.</p>
              <Button onClick={resetFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;