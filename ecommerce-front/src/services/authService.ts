import axios from 'axios';

const API_URL = 'http://localhost:4002';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

// Storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

const saveUserData = (userData: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
};

const saveToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

const getUserData = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const clearStorage = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        mot_passe: password,
      });

      const { token, user } = response.data;
      
      // Save auth data
      saveToken(token);
      saveUserData(user);
      
      return user;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw new Error('Network error');
    }
  },

  async register(name: string, email: string, password: string): Promise<User> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        nom: name,
        email,
        mot_passe: password,
      });

      const { token, user } = response.data;
      
      // Save auth data
      saveToken(token);
      saveUserData(user);
      
      return user;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw new Error('Network error');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = getToken();
      if (!token) return null;

      const response = await api.get<User>('/auth/profile');
      return response.data;
    } catch (error) {
      // If there's an error (like invalid token), clear storage
      clearStorage();
      return null;
    }
  },

  logout(): void {
    clearStorage();
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to process request');
      }
      throw new Error('Network error');
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword,
      });
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to reset password');
      }
      throw new Error('Network error');
    }
  },
};