import axios from 'axios';

const API_URL = 'http://localhost:4005';

interface Favorite {
  _id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

export const favoriteService = {
  async addToFavorites(userId: string, productId: string): Promise<Favorite> {
    try {
      const response = await axios.post(`${API_URL}/favorites`, {
        userId,
        productId
      });
      return response.data.favorite;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to add to favorites');
    }
  },

  async removeFromFavorites(userId: string, productId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/favorites/${userId}/${productId}`);
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to remove from favorites');
    }
  },

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    try {
      const response = await axios.get(`${API_URL}/favorites/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch favorites');
    }
  },

  async isProductFavorited(userId: string, productId: string): Promise<boolean> {
    try {
      const response = await axios.get(`${API_URL}/favorites/${userId}/${productId}`);
      return response.data.isFavorited;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to check favorite status');
    }
  }
}; 