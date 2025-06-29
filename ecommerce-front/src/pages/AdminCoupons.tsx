import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar,
  Percent,
  DollarSign,
  Eye,
  EyeOff
} from 'lucide-react';

interface Coupon {
  id: number;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount?: number;
  max_uses?: number;
  used_count: number;
  valid_from: string;
  valid_until?: string;
  active: boolean;
  created_by?: number;
  createdBy?: {
    nom: string;
    email: string;
  };
}

const AdminCoupons: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActive, setShowActive] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    min_order_amount: 0,
    max_uses: 0,
    valid_from: '',
    valid_until: '',
    active: true
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchCoupons();
  }, [user, navigate, currentPage, showActive]);

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        active: showActive.toString()
      });
      
      const response = await fetch(`http://localhost:4003/admin/coupons?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:4003/admin/coupons', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowAddModal(false);
        setFormData({
          code: '',
          description: '',
          type: 'percentage',
          value: 0,
          min_order_amount: 0,
          max_uses: 0,
          valid_from: '',
          valid_until: '',
          active: true
        });
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
    }
  };

  const handleUpdateCoupon = async () => {
    if (!selectedCoupon) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:4003/admin/coupons/${selectedCoupon.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowEditModal(false);
        setSelectedCoupon(null);
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
    }
  };

  const handleDeleteCoupon = async (couponId: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:4003/admin/coupons/${couponId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      min_order_amount: coupon.min_order_amount || 0,
      max_uses: coupon.max_uses || 0,
      valid_from: coupon.valid_from.split('T')[0],
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
      active: coupon.active
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (validUntil?: string) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold text-gray-900">Coupons</h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage discount coupons and promotional codes
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Coupon
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search
                </label>
                <div className="mt-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search coupons..."
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="show-active"
                  type="checkbox"
                  checked={showActive}
                  onChange={(e) => setShowActive(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="show-active" className="ml-2 block text-sm text-gray-900">
                  Show active only
                </label>
              </div>
            </div>
          </div>

          {/* Coupons table */}
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCoupons.map((coupon) => (
                        <tr key={coupon.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {coupon.code}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {coupon.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {coupon.type === 'percentage' ? (
                                <Percent className="h-4 w-4 text-gray-400 mr-1" />
                              ) : (
                                <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                              )}
                              <span className="text-sm text-gray-900">
                                {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {coupon.used_count}
                            {coupon.max_uses && ` / ${coupon.max_uses}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              !coupon.active || isExpired(coupon.valid_until)
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {!coupon.active ? 'Inactive' : isExpired(coupon.valid_until) ? 'Expired' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditCoupon(coupon)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {filteredCoupons.length === 0 && (
            <div className="text-center py-12">
              <Percent className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No coupons</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new coupon.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Coupon
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Add New Coupon
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                          Coupon Code
                        </label>
                        <input
                          type="text"
                          id="code"
                          value={formData.code}
                          onChange={(e) => setFormData({...formData, code: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="SUMMER20"
                        />
                      </div>
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <input
                          type="text"
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Summer sale discount"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                            Type
                          </label>
                          <select
                            id="type"
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value as 'percentage' | 'fixed'})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                            Value
                          </label>
                          <input
                            type="number"
                            id="value"
                            value={formData.value}
                            onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="20"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="min_order_amount" className="block text-sm font-medium text-gray-700">
                            Min Order Amount
                          </label>
                          <input
                            type="number"
                            id="min_order_amount"
                            value={formData.min_order_amount}
                            onChange={(e) => setFormData({...formData, min_order_amount: parseFloat(e.target.value) || 0})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label htmlFor="max_uses" className="block text-sm font-medium text-gray-700">
                            Max Uses
                          </label>
                          <input
                            type="number"
                            id="max_uses"
                            value={formData.max_uses}
                            onChange={(e) => setFormData({...formData, max_uses: parseInt(e.target.value) || 0})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0 (unlimited)"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="valid_from" className="block text-sm font-medium text-gray-700">
                            Valid From
                          </label>
                          <input
                            type="date"
                            id="valid_from"
                            value={formData.valid_from}
                            onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="valid_until" className="block text-sm font-medium text-gray-700">
                            Valid Until
                          </label>
                          <input
                            type="date"
                            id="valid_until"
                            value={formData.valid_until}
                            onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleCreateCoupon}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Create Coupon
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Coupon Modal */}
      {showEditModal && selectedCoupon && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Edit Coupon
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="edit-code" className="block text-sm font-medium text-gray-700">
                          Coupon Code
                        </label>
                        <input
                          type="text"
                          id="edit-code"
                          value={formData.code}
                          onChange={(e) => setFormData({...formData, code: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <input
                          type="text"
                          id="edit-description"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="edit-type" className="block text-sm font-medium text-gray-700">
                            Type
                          </label>
                          <select
                            id="edit-type"
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value as 'percentage' | 'fixed'})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="edit-value" className="block text-sm font-medium text-gray-700">
                            Value
                          </label>
                          <input
                            type="number"
                            id="edit-value"
                            value={formData.value}
                            onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="edit-min_order_amount" className="block text-sm font-medium text-gray-700">
                            Min Order Amount
                          </label>
                          <input
                            type="number"
                            id="edit-min_order_amount"
                            value={formData.min_order_amount}
                            onChange={(e) => setFormData({...formData, min_order_amount: parseFloat(e.target.value) || 0})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-max_uses" className="block text-sm font-medium text-gray-700">
                            Max Uses
                          </label>
                          <input
                            type="number"
                            id="edit-max_uses"
                            value={formData.max_uses}
                            onChange={(e) => setFormData({...formData, max_uses: parseInt(e.target.value) || 0})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="edit-valid_from" className="block text-sm font-medium text-gray-700">
                            Valid From
                          </label>
                          <input
                            type="date"
                            id="edit-valid_from"
                            value={formData.valid_from}
                            onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-valid_until" className="block text-sm font-medium text-gray-700">
                            Valid Until
                          </label>
                          <input
                            type="date"
                            id="edit-valid_until"
                            value={formData.valid_until}
                            onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleUpdateCoupon}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Update Coupon
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCoupon(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons; 