import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ShoppingBag, Truck, Package, CheckCircle, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';

type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderTracking {
  status: OrderStatus;
  lastUpdated: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  carrier?: string;
  location?: string;
  notes?: string;
}

interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  tracking: OrderTracking;
  totalAmount: number;
  items: OrderItem[];
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const statusStyles = {
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-yellow-100 text-yellow-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

function TrackingInfo({ tracking }: { tracking: OrderTracking }) {
  const getStatusIcon = () => {
    switch (tracking.status) {
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-yellow-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="mt-4 bg-gray-50 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {tracking.status.charAt(0).toUpperCase() + tracking.status.slice(1)}
          </p>
          <p className="text-sm text-gray-500">
            Last updated: {new Date(tracking.lastUpdated).toLocaleString()}
          </p>
          {tracking.estimatedDelivery && (
            <p className="text-sm text-gray-500">
              Estimated delivery: {new Date(tracking.estimatedDelivery).toLocaleDateString()}
            </p>
          )}
          {tracking.trackingNumber && (
            <p className="text-sm text-gray-500">
              Tracking number: {tracking.trackingNumber}
            </p>
          )}
          {tracking.carrier && (
            <p className="text-sm text-gray-500">
              Carrier: {tracking.carrier}
            </p>
          )}
          {tracking.location && (
            <p className="text-sm text-gray-500">
              Location: {tracking.location}
            </p>
          )}
          {tracking.notes && (
            <p className="text-sm text-gray-500 mt-1">
              {tracking.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        if (user) {
          const userOrders = await orderService.getUserOrders(user.id);
          setOrders(userOrders);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
            <ShoppingBag className="h-full w-full" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">
            When you place an order, it will appear here.
          </p>
          <Link to="/products">
            <Button variant="primary">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Order number</p>
                  <p className="font-medium text-gray-900">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date placed</p>
                  <p className="font-medium text-gray-900">
                    {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total amount</p>
                  <p className="font-medium text-gray-900">${order.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
              
              <TrackingInfo tracking={order.tracking} />
              
              <div className="border-t border-gray-200 px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
                <ul className="divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <li key={index} className="py-4 flex items-center">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={item.image || `https://via.placeholder.com/150?text=${item.name}`}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                        </div>
                        <p className="text-sm text-gray-500">Qty {item.quantity}</p>
                      </div>
                      <div className="ml-4">
                        <Link 
                          to={`/products/${item.productId}`}
                          className="text-blue-900 hover:text-blue-800 inline-flex items-center text-sm"
                        >
                          View Product
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                >
                  View Order Details
                </Button>
                {order.status === 'delivered' && (
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    Buy Again
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;