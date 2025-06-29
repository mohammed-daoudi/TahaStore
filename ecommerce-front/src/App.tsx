import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import OrdersPage from './pages/OrdersPage';
import NotFoundPage from './pages/NotFoundPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import AdminContact from './pages/AdminContact';
import AdminCoupons from './pages/AdminCoupons';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="checkout" element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
              <Route path="account" element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              } />
              <Route path="orders" element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } />
              <Route path="favorites" element={<FavoritesPage />} />
              
              {/* Admin Routes */}
              <Route path="admin" element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="admin/products" element={
                <ProtectedRoute requireAdmin>
                  <AdminProducts />
                </ProtectedRoute>
              } />
              <Route path="admin/orders" element={
                <ProtectedRoute requireAdmin>
                  <AdminOrders />
                </ProtectedRoute>
              } />
              <Route path="admin/users" element={
                <ProtectedRoute requireAdmin>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="admin/contact" element={
                <ProtectedRoute requireAdmin>
                  <AdminContact />
                </ProtectedRoute>
              } />
              <Route path="admin/coupons" element={
                <ProtectedRoute requireAdmin>
                  <AdminCoupons />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;