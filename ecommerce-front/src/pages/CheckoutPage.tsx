import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import toast from 'react-hot-toast';

function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [formData, setFormData] = useState({
    // Shipping information
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    
    // Payment information
    cardName: '',
    cardNumber: '',
    expiration: '',
    cvv: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // In a real app, we would process payment here
      
      // Then create the order
      const orderData = {
        userId: user?.id,
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        totalAmount: getTotalPrice() + (getTotalPrice() >= 50 ? 0 : 5) + (getTotalPrice() * 0.1),
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      const generatedOrderNumber = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
      setOrderNumber(generatedOrderNumber);
      
      // Clear cart
      clearCart();
      
      // Show success
      setIsComplete(true);
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error('There was a problem processing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isComplete) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto h-16 w-16 text-green-500 mb-4">
            <CheckCircle className="h-full w-full" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Complete!</h2>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for your purchase. Your order has been received.
          </p>
          <div className="inline-block bg-gray-100 rounded-lg px-4 py-2 mb-6">
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="text-xl font-medium">{orderNumber}</p>
          </div>
          <p className="text-gray-600 mb-8">
            We'll send a confirmation email to {formData.email} with your order details.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="outline" onClick={() => navigate('/orders')}>
              View Order History
            </Button>
            <Button onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div>
          <form onSubmit={handleSubmit}>
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
              
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
                
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                
                <Input
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                  
                  <Input
                    label="State/Province"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="ZIP/Postal Code"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                  />
                  
                  <Input
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
              
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="h-6 w-6 text-gray-400" />
                <span className="text-gray-600">Credit Card</span>
              </div>
              
              <div className="space-y-4">
                <Input
                  label="Name on Card"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleChange}
                  required
                />
                
                <Input
                  label="Card Number"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="XXXX XXXX XXXX XXXX"
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Expiration Date (MM/YY)"
                    name="expiration"
                    value={formData.expiration}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    required
                  />
                  
                  <Input
                    label="CVV"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    placeholder="XXX"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isProcessing}
              >
                {isProcessing ? 'Processing Order...' : 'Place Order'}
              </Button>
            </div>
          </form>
        </div>
        
        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            
            <div className="divide-y divide-gray-200">
              {/* Product list */}
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.id} className="py-4 flex">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.name}</h3>
                          <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex-1 flex items-end justify-between text-sm">
                        <p className="text-gray-500">Qty {item.quantity}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              {/* Order totals */}
              <div className="py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-medium text-gray-900">${getTotalPrice().toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Shipping</p>
                  <p className="font-medium text-gray-900">
                    {getTotalPrice() >= 50 ? 'Free' : '$5.00'}
                  </p>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Tax (10%)</p>
                  <p className="font-medium text-gray-900">${(getTotalPrice() * 0.1).toFixed(2)}</p>
                </div>
              </div>
              
              {/* Total */}
              <div className="py-4 flex justify-between">
                <p className="text-base font-medium text-gray-900">Total</p>
                <p className="text-base font-bold text-gray-900">
                  ${(getTotalPrice() + (getTotalPrice() >= 50 ? 0 : 5) + (getTotalPrice() * 0.1)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;