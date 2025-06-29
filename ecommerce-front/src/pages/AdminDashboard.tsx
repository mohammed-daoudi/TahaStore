import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Tag,
  BarChart3,
  Plus
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // For now, we'll use placeholder data
      // In a real app, you'd fetch this from your API
      setStats({
        totalProducts: 25,
        totalOrders: 150,
        totalUsers: 89,
        totalRevenue: 12500
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminMenuItems = [
    {
      title: 'Products',
      description: 'Manage your product catalog',
      icon: Package,
      href: '/admin/products',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      title: 'Orders',
      description: 'View and manage customer orders',
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      title: 'Users',
      description: 'Manage customer accounts',
      icon: Users,
      href: '/admin/users',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
    {
      title: 'Contact Messages',
      description: 'View customer inquiries',
      icon: MessageSquare,
      href: '/admin/contact',
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600'
    },
    {
      title: 'Coupons',
      description: 'Manage discount codes',
      icon: Tag,
      href: '/admin/coupons',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {user?.nom || user?.email}! Manage your e-commerce store.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Products
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalProducts}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShoppingCart className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Orders
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalOrders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalUsers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Revenue
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${stats.totalRevenue.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/admin/products"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                    <Plus className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <span className="text-gray-900 dark:text-white">Add New Product</span>
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                    Create a new product listing for your store
                  </p>
                </div>
                <span
                  className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                  aria-hidden="true"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          {/* Admin Menu */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Tools</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    to={item.href}
                    className={`relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-all duration-200 ${item.hoverColor}`}
                  >
                    <div>
                      <span className={`rounded-lg inline-flex p-3 ${item.color} text-white ring-4 ring-white`}>
                        <Icon className="h-6 w-6" />
                      </span>
                    </div>
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        {item.description}
                      </p>
                    </div>
                    <span
                      className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                      aria-hidden="true"
                    >
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                      </svg>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 