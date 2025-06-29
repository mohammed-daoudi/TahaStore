import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white tracking-wide">
          ShopEase
        </Link>
        <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg ml-8">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 w-48"
          />
        </form>
        <div className="flex items-center gap-4">
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none"
            aria-label="Toggle dark mode"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'dark' ? (
                <motion.span
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-gray-600 dark:text-gray-300"
                >
                  <Moon className="h-6 w-6" />
                </motion.span>
              ) : (
                <motion.span
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-gray-600 dark:text-gray-300"
                >
                  <Sun className="h-6 w-6" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Products
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold transition-colors">
                Admin Dashboard
              </Link>
            )}
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/cart" className="relative text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <ShoppingCart />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            
            {isAuthenticated ? (
              <div className="relative group focus-within:outline-none">
                <button 
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none"
                  tabIndex={0}
                >
                  <User className="mr-1" />
                  <span className="hidden lg:inline">{user?.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 hidden group-hover:block group-focus-within:block border border-gray-200 dark:border-gray-700">
                  <Link 
                    to="/account" 
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    My Account
                  </Link>
                  <Link 
                    to="/orders" 
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    My Orders
                  </Link>
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={logout} 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
              >
                <User className="mr-1" />
                <span className="hidden lg:inline">Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button 
              onClick={toggleMenu} 
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="block px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
            
            {/* Mobile Search Bar */}
            <form onSubmit={handleSearch} className="px-3 py-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </form>

            {/* Mobile User Actions */}
            <div className="px-3 py-2 space-y-2">
              <Link 
                to="/cart" 
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="mr-2" />
                Cart ({getTotalItems()})
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/account" 
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="mr-2" />
                    My Account
                  </Link>
                  <Link 
                    to="/orders" 
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }} 
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="mr-2" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;