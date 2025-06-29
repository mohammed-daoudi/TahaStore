import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Search,
  Filter,
  Eye,
  EyeOff,
  Package,
  X
} from 'lucide-react';

interface Product {
  id: number;
  nom: string;
  description: string;
  prix: number;
  prix_reduit?: number;
  categorie: string;
  sous_categorie?: string;
  marque?: string;
  stock: number;
  images: string[];
  actif: boolean;
  en_vedette: boolean;
  sku?: string;
}

const AdminProducts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    nom: '',
    description: '',
    prix: 0,
    prix_reduit: 0,
    categorie: '',
    sous_categorie: '',
    marque: '',
    stock: 0,
    images: [''],
    actif: true,
    en_vedette: false,
    sku: ''
  });
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:4000/admin/produit/liste', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        const errorText = await response.text();
        console.error('AdminProducts - Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    setDeletingProductId(productId);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:4000/admin/produit/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchProducts();
        alert('Product deleted successfully!');
      } else {
        const errorText = await response.text();
        console.error('Error deleting product:', errorText);
        alert('Failed to delete product. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please check your connection and try again.');
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleToggleStatus = async (productId: number, currentStatus: boolean) => {
    setUpdatingStatusId(productId);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:4000/admin/produit/${productId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ actif: !currentStatus })
      });
      
      if (response.ok) {
        fetchProducts();
        const newStatus = !currentStatus;
        alert(`Product ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      } else {
        const errorText = await response.text();
        console.error('Error updating product status:', errorText);
        alert('Failed to update product status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Failed to update product status. Please check your connection and try again.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:4000/admin/produit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
      });
      
      if (response.ok) {
        setShowAddModal(false);
        setNewProduct({
          nom: '',
          description: '',
          prix: 0,
          prix_reduit: 0,
          categorie: '',
          sous_categorie: '',
          marque: '',
          stock: 0,
          images: [''],
          actif: true,
          en_vedette: false,
          sku: ''
        });
        setUploadedImages([]);
        fetchProducts();
      } else {
        const errorText = await response.text();
        console.error('Error adding product:', errorText);
        alert('Failed to add product. Please try again.');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProduct) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:4000/admin/produit/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingProduct)
      });
      
      if (response.ok) {
        setEditingProduct(null);
        fetchProducts();
      } else {
        const errorText = await response.text();
        console.error('Error updating product:', errorText);
        alert('Failed to update product. Please try again.');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const token = localStorage.getItem('auth_token');
    const uploadedUrls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('http://localhost:4000/admin/upload-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(`http://localhost:4000${data.imageUrl}`);
        } else {
          console.error('Upload failed for file:', file.name);
        }
      }
      
      setUploadedImages(prev => [...prev, ...uploadedUrls]);
      setNewProduct(prev => ({
        ...prev,
        images: [...prev.images.filter(img => img !== ''), ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setNewProduct(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categorie === selectedCategory;
    const matchesStatus = showInactive ? true : product.actif;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(products.map(p => p.categorie))];

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
              <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage your product catalog
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
                    placeholder="Search products..."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  id="show-inactive"
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="show-inactive" className="ml-2 block text-sm text-gray-900">
                  Show inactive
                </label>
              </div>
            </div>
          </div>

          {/* Products table */}
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
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
                      {filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img
                                  className="h-10 w-10 rounded-lg object-cover"
                                  src={product.images[0] || '/placeholder-product.jpg'}
                                  alt={product.nom}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.nom}
                                </div>
                                <div className="text-sm text-gray-500">
                                  SKU: {product.sku || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.categorie}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${product.prix}
                            {product.prix_reduit && (
                              <span className="ml-2 text-sm text-red-600">
                                ${product.prix_reduit}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.stock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.actif
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.actif ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingProduct(product)}
                                className="text-blue-600 hover:text-blue-900"
                                disabled={deletingProductId === product.id || updatingStatusId === product.id}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(product.id, product.actif)}
                                className="text-gray-600 hover:text-gray-900"
                                disabled={deletingProductId === product.id || updatingStatusId === product.id}
                              >
                                {updatingStatusId === product.id ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                                ) : (
                                  product.actif ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-900"
                                disabled={deletingProductId === product.id || updatingStatusId === product.id}
                              >
                                {deletingProductId === product.id ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600"></div>
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
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

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new product.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Product</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setUploadedImages([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <input
                    type="text"
                    required
                    value={newProduct.nom}
                    onChange={(e) => setNewProduct({...newProduct, nom: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    required
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={newProduct.prix || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === '' ? 0 : parseFloat(value);
                        setNewProduct({...newProduct, prix: isNaN(numValue) ? 0 : numValue});
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sale Price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.prix_reduit || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === '' ? 0 : parseFloat(value);
                        setNewProduct({...newProduct, prix_reduit: isNaN(numValue) ? 0 : numValue});
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                      type="text"
                      required
                      value={newProduct.categorie}
                      onChange={(e) => setNewProduct({...newProduct, categorie: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newProduct.stock || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === '' ? 0 : parseInt(value);
                        setNewProduct({...newProduct, stock: isNaN(numValue) ? 0 : numValue});
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Brand</label>
                  <input
                    type="text"
                    value={newProduct.marque}
                    onChange={(e) => setNewProduct({...newProduct, marque: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU</label>
                  <input
                    type="text"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Images</label>
                  <div className="mt-1">
                    {/* File Upload Area */}
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="image-upload"
                        disabled={uploading}
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2">
                          <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                            {uploading ? 'Uploading...' : 'Click to upload images or drag and drop'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF up to 10MB each
                          </p>
                        </div>
                      </label>
                    </div>
                    
                    {/* Uploaded Images Preview */}
                    {uploadedImages.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {uploadedImages.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`Product ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newProduct.actif}
                      onChange={(e) => setNewProduct({...newProduct, actif: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newProduct.en_vedette}
                      onChange={(e) => setNewProduct({...newProduct, en_vedette: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured</span>
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setUploadedImages([]);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Product</h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleEditProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.nom}
                    onChange={(e) => setEditingProduct({...editingProduct, nom: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    required
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={editingProduct.prix || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === '' ? 0 : parseFloat(value);
                        setEditingProduct({...editingProduct, prix: isNaN(numValue) ? 0 : numValue});
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sale Price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editingProduct.prix_reduit || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === '' ? 0 : parseFloat(value);
                        setEditingProduct({...editingProduct, prix_reduit: isNaN(numValue) ? 0 : numValue});
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.categorie}
                      onChange={(e) => setEditingProduct({...editingProduct, categorie: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editingProduct.stock || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === '' ? 0 : parseInt(value);
                        setEditingProduct({...editingProduct, stock: isNaN(numValue) ? 0 : numValue});
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Brand</label>
                  <input
                    type="text"
                    value={editingProduct.marque || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, marque: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU</label>
                  <input
                    type="text"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingProduct.actif}
                      onChange={(e) => setEditingProduct({...editingProduct, actif: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingProduct.en_vedette}
                      onChange={(e) => setEditingProduct({...editingProduct, en_vedette: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured</span>
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Update Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts; 