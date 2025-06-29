// This service should only contain real API calls. If not needed, you can delete this file.

import axios from 'axios';
import { ORDER_API_URL } from './api';

export const fetchOrders = async () => {
  const response = await axios.get(`${ORDER_API_URL}/commande`);
  return response.data;
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  const response = await axios.patch(`${ORDER_API_URL}/commande/${orderId}/status`, { status });
  return response.data;
};