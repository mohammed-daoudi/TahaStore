// This is a mock service that would connect to your commande-service backend
// Replace with actual API calls when connecting to your backend

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderTracking {
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  lastUpdated: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  carrier?: string;
  location?: string;
  notes?: string;
}

interface Order {
  id: string;
  userId: string;
  date: string;
  status: OrderTracking['status'];
  tracking: OrderTracking;
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const generateTrackingNumber = () => {
  return 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const generateEstimatedDelivery = () => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * 5) + 3); // 3-7 days from now
  return date.toISOString();
};

export const orderService = {
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    // In a real app, you would make an API call to your commande-service
    // return api.post('/orders', orderData);
    
    // For development, we'll simulate creating an order
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOrder: Order = {
          id: 'ORD-' + Math.floor(10000 + Math.random() * 90000),
          userId: orderData.userId || 'unknown',
          date: new Date().toISOString(),
          status: 'processing',
          tracking: {
            status: 'processing',
            lastUpdated: new Date().toISOString(),
            estimatedDelivery: generateEstimatedDelivery(),
            notes: 'Order received and is being processed'
          },
          totalAmount: orderData.totalAmount || 0,
          items: orderData.items || [],
          shippingAddress: orderData.shippingAddress || {
            fullName: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
          },
        };
        
        // Simulate order status updates
        setTimeout(() => {
          this.updateOrderStatus(newOrder.id, 'shipped');
        }, 1000 * 60 * 60 * 24); // 24 hours later
        
        setTimeout(() => {
          this.updateOrderStatus(newOrder.id, 'delivered');
        }, 1000 * 60 * 60 * 24 * 3); // 3 days later
        
        resolve(newOrder);
      }, 1000);
    });
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    // In a real app, you would make an API call to your commande-service
    // return api.get(`/orders?userId=${userId}`);
    
    // For development, we'll return mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockOrders: Order[] = [
          {
            id: 'ORD-12345',
            userId,
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
            status: 'delivered',
            tracking: {
              status: 'delivered',
              lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
              trackingNumber: generateTrackingNumber(),
              carrier: 'FedEx',
              location: 'Delivered to recipient',
              notes: 'Package was delivered to the recipient'
            },
            totalAmount: 159.97,
            items: [
              {
                productId: '1',
                name: 'Wireless Headphones',
                price: 99.99,
                quantity: 1,
                image: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
              },
              {
                productId: '4',
                name: 'Coffee Maker',
                price: 79.99,
                quantity: 1,
                image: 'https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
              },
            ],
            shippingAddress: {
              fullName: 'John Doe',
              address: '123 Main St',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              country: 'USA',
            },
          },
          {
            id: 'ORD-12346',
            userId,
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
            status: 'shipped',
            tracking: {
              status: 'shipped',
              lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
              trackingNumber: generateTrackingNumber(),
              carrier: 'UPS',
              location: 'In transit',
              estimatedDelivery: generateEstimatedDelivery(),
              notes: 'Package is in transit to the destination'
            },
            totalAmount: 69.99,
            items: [
              {
                productId: '5',
                name: 'Bluetooth Speaker',
                price: 69.99,
                quantity: 1,
                image: 'https://images.pexels.com/photos/3395251/pexels-photo-3395251.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
              },
            ],
            shippingAddress: {
              fullName: 'John Doe',
              address: '123 Main St',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              country: 'USA',
            },
          },
        ];
        
        resolve(mockOrders);
      }, 500);
    });
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    // In a real app, you would make an API call to your commande-service
    // return api.get(`/orders/${orderId}`);
    
    // For development, we'll return mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockOrder: Order = {
          id: orderId,
          userId: 'user_123',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          status: 'shipped',
          tracking: {
            status: 'shipped',
            lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
            trackingNumber: generateTrackingNumber(),
            carrier: 'UPS',
            location: 'In transit',
            estimatedDelivery: generateEstimatedDelivery(),
            notes: 'Package is in transit to the destination'
          },
          totalAmount: 69.99,
          items: [
            {
              productId: '5',
              name: 'Bluetooth Speaker',
              price: 69.99,
              quantity: 1,
              image: 'https://images.pexels.com/photos/3395251/pexels-photo-3395251.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            },
          ],
          shippingAddress: {
            fullName: 'John Doe',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA',
          },
        };
        
        resolve(mockOrder);
      }, 500);
    });
  },

  async updateOrderStatus(orderId: string, newStatus: OrderTracking['status']): Promise<void> {
    // In a real app, you would make an API call to your commande-service
    // return api.patch(`/orders/${orderId}/status`, { status: newStatus });
    
    // For development, we'll simulate updating the order status
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Order ${orderId} status updated to ${newStatus}`);
        resolve();
      }, 500);
    });
  },
};