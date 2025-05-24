import axios from 'axios';

// API base URLs
export const AUTH_API_URL = 'http://localhost:4002';
export const PRODUCT_API_URL = 'http://localhost:4000';
export const ORDER_API_URL = 'http://localhost:4001';

// Auth API endpoints
export const authAPI = {
  register: (data: { nom: string; email: string; mot_passe: string }) =>
    axios.post(`${AUTH_API_URL}/auth/register`, data),
  login: (data: { email: string; mot_passe: string }) =>
    axios.post(`${AUTH_API_URL}/auth/login`, data),
};

// Product API endpoints
export const productAPI = {
  addProduct: (data: { nom: string; description: string; prix: number }) =>
    axios.post(`${PRODUCT_API_URL}/produit/ajouter`, data),
  buyProducts: (ids: string[]) =>
    axios.post(`${PRODUCT_API_URL}/produit/acheter`, { ids }),
};

// Order API endpoints
export const orderAPI = {
  addOrder: (ids: string[], token: string) =>
    axios.post(
      `${ORDER_API_URL}/commande/ajouter`,
      { ids },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),
};

// Axios interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
); 