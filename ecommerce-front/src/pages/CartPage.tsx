import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import CartItem from '../components/cart/CartItem';
import Button from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function CartPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
            <ShoppingBag className="h-full w-full" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link to="/products">
            <Button variant="primary">
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flow-root">
                <ul className="-my-6 divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.id} className="py-6">
                      <CartItem {...item} />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex justify-between">
                <Link to="/products">
                  <Button variant="outline">
                    Continue Shopping
                  </Button>
                </Link>
                <Button variant="outline" onClick={clearCart} className="text-red-600 border-red-600 hover:bg-red-50">
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <div className="flow-root">
                <dl className="-my-4 text-sm divide-y divide-gray-200">
                  <div className="py-4 flex items-center justify-between">
                    <dt className="text-gray-600">Subtotal</dt>
                    <dd className="font-medium text-gray-900">${getTotalPrice().toFixed(2)}</dd>
                  </div>
                  <div className="py-4 flex items-center justify-between">
                    <dt className="text-gray-600">Shipping</dt>
                    <dd className="font-medium text-gray-900">
                      {getTotalPrice() >= 50 ? 'Free' : '$5.00'}
                    </dd>
                  </div>
                  <div className="py-4 flex items-center justify-between">
                    <dt className="text-gray-600">Tax</dt>
                    <dd className="font-medium text-gray-900">${(getTotalPrice() * 0.1).toFixed(2)}</dd>
                  </div>
                  <div className="py-4 flex items-center justify-between">
                    <dt className="text-base font-medium text-gray-900">Order Total</dt>
                    <dd className="text-base font-bold text-gray-900">
                      ${(getTotalPrice() + (getTotalPrice() >= 50 ? 0 : 5) + (getTotalPrice() * 0.1)).toFixed(2)}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="mt-6">
                <Button variant="primary" fullWidth onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Free shipping on orders over $50. Easy returns.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;