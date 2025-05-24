// This is a mock service that would connect to your product-service backend
// Replace with actual API calls when connecting to your backend

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  reviewCount: number;
  features: string[];
  specifications: Record<string, string>;
}

// Mock product data
const mockProducts = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 99.99,
    description: 'Experience premium sound quality with our wireless headphones. Featuring active noise cancellation, comfortable over-ear design, and long battery life.',
    images: [
      'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/164710/pexels-photo-164710.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'Electronics',
    stock: 15,
    rating: 4.7,
    reviewCount: 124,
    features: [
      'Active noise cancellation',
      '30-hour battery life',
      'Premium sound quality',
      'Comfortable over-ear design',
      'Bluetooth 5.0 connectivity',
      'Built-in microphone for calls',
    ],
    specifications: {
      brand: 'AudioTech',
      model: 'SoundPro X7',
      color: 'Black',
      connectivity: 'Bluetooth 5.0',
      batteryLife: '30 hours',
      weight: '250g',
    },
  },
  {
    id: '2',
    name: 'Smart Watch',
    price: 159.99,
    description: 'Track your fitness and stay connected with this smartwatch. Features activity tracking, heart rate monitoring, and smartphone notifications.',
    images: [
      'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'Electronics',
    stock: 10,
    rating: 4.5,
    reviewCount: 89,
    features: [
      'Activity tracking',
      'Heart rate monitoring',
      'Sleep tracking',
      'Smartphone notifications',
      'Water resistant (50m)',
      '7-day battery life',
    ],
    specifications: {
      brand: 'FitTech',
      model: 'Pulse Pro',
      color: 'Silver',
      connectivity: 'Bluetooth 5.0',
      batteryLife: '7 days',
      weight: '45g',
    },
  },
  {
    id: '3',
    name: 'Desk Lamp',
    price: 49.99,
    description: 'Adjustable desk lamp with multiple brightness levels. Perfect for your home office or study area.',
    images: [
      'https://images.pexels.com/photos/4050304/pexels-photo-4050304.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/7000506/pexels-photo-7000506.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/943257/pexels-photo-943257.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'Home',
    stock: 25,
    rating: 4.3,
    reviewCount: 56,
    features: [
      'Adjustable arm',
      '3 color temperature modes',
      '5 brightness levels',
      'Touch controls',
      'USB charging port',
      'Timer function',
    ],
    specifications: {
      brand: 'LuxLight',
      model: 'FlexBeam Pro',
      color: 'White',
      powerSource: 'Corded Electric',
      wattage: '10W',
      weight: '1.2kg',
    },
  },
  {
    id: '4',
    name: 'Coffee Maker',
    price: 79.99,
    description: 'Programmable coffee maker for your perfect morning brew. Features multiple brew strengths and a built-in grinder.',
    images: [
      'https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1833651/pexels-photo-1833651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/6542420/pexels-photo-6542420.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    category: 'Home',
    stock: 12,
    rating: 4.6,
    reviewCount: 78,
    features: [
      'Programmable timer',
      'Built-in grinder',
      'Multiple brew strengths',
      '12-cup capacity',
      'Keep warm function',
      'Auto shut-off',
    ],
    specifications: {
      brand: 'BrewMaster',
      model: 'Grind & Brew Pro',
      color: 'Stainless Steel',
      capacity: '12 cups',
      wattage: '1000W',
      weight: '3.5kg',
    },
  },
];

export const productService = {
  async getProducts(params?: Record<string, string>): Promise<any[]> {
    // In a real app, you would make an API call to your product-service
    // return api.get('/products', { params });
    
    // For development, we'll return mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredProducts = [...mockProducts];
        
        if (params) {
          // Filter by category
          if (params.category) {
            filteredProducts = filteredProducts.filter(
              p => p.category.toLowerCase() === params.category.toLowerCase()
            );
          }
          
          // Filter by search term
          if (params.search) {
            const searchTerm = params.search.toLowerCase();
            filteredProducts = filteredProducts.filter(
              p => p.name.toLowerCase().includes(searchTerm) || 
                   p.description.toLowerCase().includes(searchTerm)
            );
          }
          
          // Filter by price range
          if (params.minPrice) {
            filteredProducts = filteredProducts.filter(
              p => p.price >= parseFloat(params.minPrice)
            );
          }
          
          if (params.maxPrice) {
            filteredProducts = filteredProducts.filter(
              p => p.price <= parseFloat(params.maxPrice)
            );
          }
          
          // Sort products
          if (params.sort) {
            switch (params.sort) {
              case 'price_asc':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
              case 'price_desc':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
              case 'popular':
                filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
              default: // 'newest'
                // No change to order
                break;
            }
          }
        }
        
        resolve(filteredProducts);
      }, 500);
    });
  },

  async getProductById(id: string): Promise<Product | null> {
    // In a real app, you would make an API call to your product-service
    // return api.get(`/products/${id}`);
    
    // For development, we'll return mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = mockProducts.find(p => p.id === id);
        resolve(product || null);
      }, 500);
    });
  },

  async getFeaturedProducts(): Promise<any[]> {
    // In a real app, you would make an API call to your product-service
    // return api.get('/products/featured');
    
    // For development, we'll return mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        // Just return the first 4 products as featured
        resolve(mockProducts.slice(0, 4));
      }, 500);
    });
  },

  async getRelatedProducts(productId: string): Promise<any[]> {
    // In a real app, you would make an API call to your product-service
    // return api.get(`/products/${productId}/related`);
    
    // For development, we'll return mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentProduct = mockProducts.find(p => p.id === productId);
        
        if (currentProduct) {
          // Return products in the same category, excluding the current one
          const related = mockProducts.filter(
            p => p.category === currentProduct.category && p.id !== currentProduct.id
          );
          resolve(related);
        } else {
          resolve([]);
        }
      }, 500);
    });
  },
};