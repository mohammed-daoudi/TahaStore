import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

interface Product {
  id: number;
  nom: string;
  prix: number;
  description: string;
  description_courte?: string;
  images: string[];
  categorie: string;
  marque?: string;
  stock: number;
  note_moyenne: number;
  nombre_avis: number;
  caracteristiques?: Record<string, string>;
  tags?: string[];
  est_actif: boolean;
  est_en_promo: boolean;
  prix_promo?: number;
}

interface Review {
  id: number;
  note: number;
  commentaire?: string;
  user: {
    nom: string;
  };
  created_at: string;
}

export const productService = {
  async getProducts(params?: Record<string, string>): Promise<Product[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params) {
        if (params.category) queryParams.append('category', params.category);
        if (params.search) queryParams.append('search', params.search);
        if (params.minPrice) queryParams.append('minPrice', params.minPrice);
        if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
        if (params.sort) queryParams.append('sort', params.sort);
      }
      
      const response = await axios.get(`${API_BASE_URL}/produit/liste?${queryParams}`);
      
      // Parse JSON fields
      return response.data.map((product: any) => ({
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        caracteristiques: product.caracteristiques ? JSON.parse(product.caracteristiques) : {},
        tags: product.tags ? JSON.parse(product.tags) : []
      }));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/produit/${id}`);
      
      const product = response.data;
      return {
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        caracteristiques: product.caracteristiques ? JSON.parse(product.caracteristiques) : {},
        tags: product.tags ? JSON.parse(product.tags) : []
      };
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return null;
    }
  },

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      // Get first 4 products as featured
      const response = await axios.get(`${API_BASE_URL}/produit/liste?sort=popular`);
      
      const products = response.data.slice(0, 4);
      return products.map((product: any) => ({
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        caracteristiques: product.caracteristiques ? JSON.parse(product.caracteristiques) : {},
        tags: product.tags ? JSON.parse(product.tags) : []
      }));
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      throw error;
    }
  },

  async getRelatedProducts(productId: string): Promise<Product[]> {
    try {
      const product = await this.getProductById(productId);
      if (!product) return [];
      
      // Get products in the same category
      const response = await axios.get(`${API_BASE_URL}/produit/liste?category=${product.categorie}`);
      
      const products = response.data.filter((p: any) => p.id != productId).slice(0, 3);
      return products.map((product: any) => ({
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        caracteristiques: product.caracteristiques ? JSON.parse(product.caracteristiques) : {},
        tags: product.tags ? JSON.parse(product.tags) : []
      }));
    } catch (error) {
      console.error('Failed to fetch related products:', error);
      return [];
    }
  },

  async addToFavorites(userId: number, productId: number): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/favorites`, {
        userId,
        productId
      });
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      throw error;
    }
  },

  async removeFromFavorites(userId: number, productId: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/favorites/${userId}/${productId}`);
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      throw error;
    }
  },

  async getFavorites(userId: number): Promise<Product[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/favorites/${userId}`);
      
      return response.data.map((favorite: any) => ({
        ...favorite.product,
        images: favorite.product.images ? JSON.parse(favorite.product.images) : [],
        caracteristiques: favorite.product.caracteristiques ? JSON.parse(favorite.product.caracteristiques) : {},
        tags: favorite.product.tags ? JSON.parse(favorite.product.tags) : []
      }));
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      throw error;
    }
  },

  async checkFavoriteStatus(userId: number, productId: number): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/favorites/${userId}/${productId}`);
      return response.data.isFavorited;
    } catch (error) {
      console.error('Failed to check favorite status:', error);
      return false;
    }
  },

  async addReview(productId: number, userId: number, note: number, commentaire?: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/produit/${productId}/reviews`, {
        userId,
        note,
        commentaire
      });
    } catch (error) {
      console.error('Failed to add review:', error);
      throw error;
    }
  }
};