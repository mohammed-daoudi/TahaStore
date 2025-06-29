import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, Tag, X, ChevronDown, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Country data with flags, codes, and names
const countries = [
  { name: 'Afghanistan', code: 'AF', dialCode: '+93', flag: '🇦🇫' },
  { name: 'Albania', code: 'AL', dialCode: '+355', flag: '🇦🇱' },
  { name: 'Algeria', code: 'DZ', dialCode: '+213', flag: '🇩🇿' },
  { name: 'Argentina', code: 'AR', dialCode: '+54', flag: '🇦🇷' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'Austria', code: 'AT', dialCode: '+43', flag: '🇦🇹' },
  { name: 'Belgium', code: 'BE', dialCode: '+32', flag: '🇧🇪' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳' },
  { name: 'Denmark', code: 'DK', dialCode: '+45', flag: '🇩🇰' },
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬' },
  { name: 'Finland', code: 'FI', dialCode: '+358', flag: '🇫🇮' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'Greece', code: 'GR', dialCode: '+30', flag: '🇬🇷' },
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: '🇮🇩' },
  { name: 'Iran', code: 'IR', dialCode: '+98', flag: '🇮🇷' },
  { name: 'Iraq', code: 'IQ', dialCode: '+964', flag: '🇮🇶' },
  { name: 'Ireland', code: 'IE', dialCode: '+353', flag: '🇮🇪' },
  { name: 'Israel', code: 'IL', dialCode: '+972', flag: '🇮🇱' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵' },
  { name: 'Jordan', code: 'JO', dialCode: '+962', flag: '🇯🇴' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965', flag: '🇰🇼' },
  { name: 'Lebanon', code: 'LB', dialCode: '+961', flag: '🇱🇧' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
  { name: 'Morocco', code: 'MA', dialCode: '+212', flag: '🇲🇦' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿' },
  { name: 'Norway', code: 'NO', dialCode: '+47', flag: '🇳🇴' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92', flag: '🇵🇰' },
  { name: 'Philippines', code: 'PH', dialCode: '+63', flag: '🇵🇭' },
  { name: 'Poland', code: 'PL', dialCode: '+48', flag: '🇵🇱' },
  { name: 'Portugal', code: 'PT', dialCode: '+351', flag: '🇵🇹' },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦' },
  { name: 'Russia', code: 'RU', dialCode: '+7', flag: '🇷🇺' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  { name: 'South Korea', code: 'KR', dialCode: '+82', flag: '🇰🇷' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: '🇸🇪' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', flag: '🇨🇭' },
  { name: 'Syria', code: 'SY', dialCode: '+963', flag: '🇸🇾' },
  { name: 'Thailand', code: 'TH', dialCode: '+66', flag: '🇹🇭' },
  { name: 'Tunisia', code: 'TN', dialCode: '+216', flag: '🇹🇳' },
  { name: 'Turkey', code: 'TR', dialCode: '+90', flag: '🇹🇷' },
  { name: 'Ukraine', code: 'UA', dialCode: '+380', flag: '🇺🇦' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'Vietnam', code: 'VN', dialCode: '+84', flag: '🇻🇳' },
  { name: 'Yemen', code: 'YE', dialCode: '+967', flag: '🇾🇪' },
].sort((a, b) => a.name.localeCompare(b.name));

function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Phone number state
  const [selectedCountry, setSelectedCountry] = useState(countries.find(c => c.code === 'US') || countries[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const [formData, setFormData] = useState({
    // Shipping information
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
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

  // Filter countries based on search
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.dialCode.includes(countrySearch)
  );

  // Calculate totals
  const subtotal = getTotalPrice();
  const shipping = subtotal >= 50 ? 0 : 5;
  const tax = subtotal * 0.1;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = subtotal + shipping + tax - couponDiscount;

  // Validate coupon
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const response = await fetch('http://localhost:4003/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode,
          orderAmount: subtotal + shipping + tax, // Total before coupon
          existingDiscount: 0 // No existing discounts for now
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAppliedCoupon(data);
        toast.success(`Coupon applied! You saved $${data.discountAmount.toFixed(2)}`);
        setCouponCode('');
      } else {
        toast.error(data.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast.error('Failed to validate coupon. Please try again.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Check if Israel is selected
    if (selectedCountry.code === 'IL') {
      toast.error('We don\'t sell to hoes');
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
          email: formData.email,
          phone: selectedCountry.dialCode + formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        totalAmount: total,
        couponCode: appliedCoupon?.coupon?.code || null,
        discountAmount: couponDiscount,
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

                {/* Phone Number with Country Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex">
                    {/* Country Selector */}
                    <div className="relative flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-l-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <span className="text-sm font-medium text-gray-900">{selectedCountry.dialCode}</span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </button>

                      {/* Country Dropdown */}
                      {showCountryDropdown && (
                        <div className="absolute z-10 mt-1 w-80 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {/* Search Input */}
                          <div className="p-3 border-b border-gray-200">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search countries..."
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>

                          {/* Country List */}
                          <div className="max-h-48 overflow-y-auto">
                            {filteredCountries.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(country);
                                  setShowCountryDropdown(false);
                                  setCountrySearch('');
                                  
                                  // Show message for Israel
                                  if (country.code === 'IL') {
                                    toast.error('We don\'t sell to hoes');
                                  }
                                }}
                                className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                              >
                                <span className="text-lg">{country.flag}</span>
                                <span className="flex-1 text-left text-sm font-medium text-gray-900">
                                  {country.flag} {country.name}
                                </span>
                                <span className="text-sm text-gray-500">{country.dialCode}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phone Input */}
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  {/* Israel Warning Message */}
                  {selectedCountry.code === 'IL' && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800 font-medium">
                        We don't sell to hoes
                      </p>
                    </div>
                  )}
                </div>
                
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
            
            {/* Coupon Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Coupon Code
              </h3>
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      {appliedCoupon.coupon.code}
                    </p>
                    <p className="text-xs text-green-600">
                      -${appliedCoupon.discountAmount.toFixed(2)} discount
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={validateCoupon}
                    isLoading={isValidatingCoupon}
                    disabled={!couponCode.trim()}
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>
            
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
                  <p className="font-medium text-gray-900">${subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Shipping</p>
                  <p className="font-medium text-gray-900">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </p>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Tax (10%)</p>
                  <p className="font-medium text-gray-900">${tax.toFixed(2)}</p>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <p>Discount ({appliedCoupon.coupon.code})</p>
                    <p>-${couponDiscount.toFixed(2)}</p>
                  </div>
                )}
              </div>
              
              {/* Total */}
              <div className="py-4 flex justify-between">
                <p className="text-base font-medium text-gray-900">Total</p>
                <p className="text-base font-bold text-gray-900">
                  ${total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close country dropdown */}
      {showCountryDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowCountryDropdown(false)}
        />
      )}
    </div>
  );
}

export default CheckoutPage;